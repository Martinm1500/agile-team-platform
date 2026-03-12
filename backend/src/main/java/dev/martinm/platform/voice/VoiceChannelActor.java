package dev.martinm.platform.voice;

import dev.martinm.platform.voice.dto.ConsumePayload;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import reactor.core.Disposable;
import reactor.core.Disposables;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.LongAdder;

@Slf4j
public class VoiceChannelActor {
    @Getter
    private final Long channelId;
    private final VoiceMessagingService messagingService;
    private final MediasoupClient mediasoupClient;
    private final VoicePresenceService voicePresenceService;
    private final UserChannelStateManager userChannelStateManager;
    private final Sinks.Many<VoiceCommand> sink;
    private final Disposable.Composite subscriptions;

    private final ConcurrentHashMap<Long, UserState> userStates = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Long> orchestratingUsers = new ConcurrentHashMap<>();

    private final RouterManager routerManager;
    private final AtomicReference<CapacityState> capacityState = new AtomicReference<>(CapacityState.initial());
    private final long heartbeatTimeout;
    private final int maxMailboxSize;
    private final AtomicLong processedCommands = new AtomicLong(0);
    private final AtomicLong failedCommands = new AtomicLong(0);
    private final AtomicLong rejectedCommands = new AtomicLong(0);
    private final LongAdder queueTime = new LongAdder();
    private final AtomicLong lastCommandTime = new AtomicLong(System.currentTimeMillis());
    private final AtomicLong lastActivityTime = new AtomicLong(System.currentTimeMillis());
    private final AtomicBoolean isHealthy = new AtomicBoolean(true);
    private final AtomicBoolean isDisposed = new AtomicBoolean(false);
    private final AtomicBoolean periodicTasksInitialized = new AtomicBoolean(false);

    public VoiceChannelActor(Long channelId,
                             VoiceMessagingService messagingService,
                             MediasoupClient mediasoupClient,
                             VoicePresenceService voicePresenceService,
                             UserChannelStateManager userChannelStateManager,
                             long heartbeatTimeout,
                             int maxMailboxSize,
                             Scheduler scheduler) {
        this.channelId = channelId;
        this.messagingService = messagingService;
        this.mediasoupClient = mediasoupClient;
        this.voicePresenceService = voicePresenceService;
        this.userChannelStateManager = userChannelStateManager;
        this.heartbeatTimeout = heartbeatTimeout;
        this.maxMailboxSize = maxMailboxSize;
        this.routerManager = new RouterManager(channelId, mediasoupClient);

        this.sink = Sinks.many().unicast().onBackpressureBuffer();
        this.subscriptions = Disposables.composite();

        isHealthy.set(true);

        Disposable commandSubscription = sink.asFlux()
                .publishOn(Schedulers.boundedElastic())
                .doOnNext(this::processCommand)
                .onErrorResume(error -> {
                    log.error("Error in command stream for channel {}", channelId, error);
                    isHealthy.set(false);
                    return Mono.empty();
                })
                .subscribe();

        subscriptions.add(commandSubscription);

        scheduler.schedule(() -> setupPeriodicTasks(scheduler), 100, TimeUnit.MILLISECONDS);
    }

    private void setupPeriodicTasks(Scheduler scheduler) {
        if (periodicTasksInitialized.compareAndSet(false, true)) {
            subscriptions.add(Flux.interval(Duration.ofSeconds(30))
                    .subscribeOn(scheduler)
                    .doOnNext(i -> cleanupInactiveUsers())
                    .subscribe());

            subscriptions.add(Flux.interval(Duration.ofMinutes(1))
                    .subscribeOn(scheduler)
                    .doOnNext(i -> checkHealth())
                    .subscribe());

            subscriptions.add(Flux.interval(Duration.ofSeconds(15))
                    .subscribeOn(scheduler)
                    .doOnNext(i -> routerManager.checkAndHandleTimeout(!userStates.isEmpty()))
                    .subscribe());
        }
    }

    public int getActiveUsers() {
        return userStates.size();
    }

    public boolean canAcceptCommand() {
        return capacityState.get().pendingCommands() < maxMailboxSize;
    }

    public boolean isOverloaded() {
        return capacityState.get().overloaded();
    }

    public boolean isIdle() {
        long now = System.currentTimeMillis();
        return (now - lastActivityTime.get()) > TimeUnit.MINUTES.toMillis(5);
    }

    public Mono<Void> send(VoiceCommand command) {
        return Mono.defer(() -> {
            if (isDisposed.get()) {
                return Mono.error(new IllegalStateException("Actor is disposed"));
            }

            lastCommandTime.set(System.currentTimeMillis());
            lastActivityTime.set(System.currentTimeMillis());

            final long startTime = System.nanoTime();

            if (!acquireCapacitySlot()) {
                rejectedCommands.incrementAndGet();
                return Mono.error(new IllegalStateException("Channel actor overloaded"));
            }

            return Mono.<Void>create(emitter -> {
                        try {
                            long queueStart = System.nanoTime();

                            Sinks.EmitResult result = sink.tryEmitNext(command);
                            if (result != Sinks.EmitResult.OK) {
                                throw new IllegalStateException("Failed to emit command: " + result);
                            }

                            queueTime.add(System.nanoTime() - queueStart);
                            emitter.success();
                        } catch (Exception e) {
                            failedCommands.incrementAndGet();
                            emitter.error(e);
                        }
                    })
                    .timeout(Duration.ofSeconds(10))
                    .doOnSuccess(v -> processedCommands.incrementAndGet())
                    .doOnError(e -> failedCommands.incrementAndGet())
                    .doFinally(signal -> {
                        releaseCapacitySlot();

                        long processingTime = System.nanoTime() - startTime;
                        if (processingTime > TimeUnit.SECONDS.toNanos(2)) {
                            log.warn("Slow command processing for channel {}: {}ms",
                                    channelId, TimeUnit.NANOSECONDS.toMillis(processingTime));
                        }
                    });
        });
    }

    private boolean acquireCapacitySlot() {
        for (int attempt = 0; attempt < 100; attempt++) {
            CapacityState current = capacityState.get();

            if (current.pendingCommands() >= maxMailboxSize) {
                return false;
            }

            CapacityState next = current.incrementCommands(maxMailboxSize);
            if (capacityState.compareAndSet(current, next)) {
                return true;
            }

            if (attempt > 10 && attempt % 10 == 0) {
                try {
                    Thread.sleep(Math.min(10, 1L << Math.min((attempt - 10) / 10, 5)));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        return false;
    }

    private void releaseCapacitySlot() {
        while (true) {
            CapacityState current = capacityState.get();
            CapacityState next = current.decrementCommands(maxMailboxSize);
            if (capacityState.compareAndSet(current, next)) {
                break;
            }
        }
    }

    private void processCommand(VoiceCommand command) {
        if (isDisposed.get()) {
            return;
        }

        try {
            lastCommandTime.set(System.currentTimeMillis());
            lastActivityTime.set(System.currentTimeMillis());

            switch (command) {
                case JoinCmd joinCmd -> handleJoin(joinCmd);
                case LeaveCmd leaveCmd -> handleLeave(leaveCmd);
                case HeartbeatCmd heartbeatCmd -> handleHeartbeat(heartbeatCmd);
                case ConnectTransportCmd connectCmd -> handleConnectTransport(connectCmd);
                case ProduceCmd produceCmd -> handleProduce(produceCmd);
                case ConsumeCmd consumeCmd -> handleConsume(consumeCmd);
                case MuteCmd muteCmd -> handleMute(muteCmd);
                default -> log.warn("Unknown command type: {}", command.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Error processing command for channel {}", channelId, e);
        }
    }

    // ==================== Command Handlers ====================

    private void handleJoin(JoinCmd cmd) {
        final Long userId = cmd.user().getId();
        final Long serverId = cmd.serverId();

        UserState previousState = userStates.putIfAbsent(userId, new UserState());

        if (previousState == null) {
            lastActivityTime.set(System.currentTimeMillis());

            routerManager.ensureRouterCreatedSync();

            orchestratingUsers.put(userId, System.currentTimeMillis());

            orchestrateUserConnection(userId, serverId)
                    .doFinally(signal -> orchestratingUsers.remove(userId))
                    .subscribe(
                            v -> log.info("User {} fully orchestrated in channel {}", userId, channelId),
                            e -> {
                                log.error("Orchestration failed for user {} in channel {}", userId, channelId, e);
                                messagingService.sendError(userId, "Connection failed", e.getMessage()).subscribe();
                                userStates.remove(userId);
                            }
                    );
        } else {
            userStates.computeIfPresent(userId, (key, state) -> state.updateHeartbeat());
        }
    }

    private Mono<Void> orchestrateUserConnection(Long userId, Long serverId) {
        return Mono.defer(() -> {
            log.info("Starting connection orchestration for user {} in channel {}", userId, channelId);

            return mediasoupClient.getRtpCapabilities(channelId)
                    .flatMap(rtp -> {
                        userStates.computeIfPresent(userId, (key, state) ->
                                state.withRtpCapabilities(rtp));
                        return messagingService.sendRtpCapabilities(userId, rtp);
                    })
                    .then(Mono.delay(Duration.ofMillis(100)))
                    .then(mediasoupClient.createWebRtcTransport(channelId, userId, true, false))
                    .flatMap(sendTransport -> {
                        log.info("Send transport created for user {} in channel {}", userId, channelId);
                        return messagingService.sendCreateSendTransport(userId, sendTransport);
                    })
                    .then(Mono.delay(Duration.ofMillis(100)))
                    .then(mediasoupClient.createWebRtcTransport(channelId, userId, false, true))
                    .flatMap(recvTransport -> {
                        log.info("Recv transport created for user {} in channel {}", userId, channelId);
                        String transportId = (String) recvTransport.get("id");
                        userStates.computeIfPresent(userId, (key, state) ->
                                state.withRecvTransportId(transportId));
                        return messagingService.sendCreateRecvTransport(userId, recvTransport);
                    })
                    .then(Mono.delay(Duration.ofMillis(50)))
                    .then(messagingService.sendStartProducing(userId))
                    .then(messagingService.sendConnectionStateChanged(userId, "connected", channelId))
                    .doOnSuccess(v -> {
                        userStates.computeIfPresent(userId, (key, state) -> state.markReadyToProduce());
                        userStates.computeIfPresent(userId, (key, state) -> state.updateHeartbeat());
                        log.info("User {} ready to produce in channel {}", userId, channelId);
                        voicePresenceService.userJoinedChannel(serverId, channelId, userId);
                    })
                    .then(Mono.defer(() -> {
                        UserState newUserState = userStates.get(userId);
                        if (newUserState == null
                                || newUserState.recvTransportId() == null
                                || newUserState.rtpCapabilities() == null) {
                            return Mono.empty();
                        }

                        List<Mono<Void>> existingProducerConsumers = userStates.entrySet().stream()
                                .filter(entry -> !entry.getKey().equals(userId))
                                .filter(entry -> entry.getValue().producerId() != null)
                                .map(entry -> {
                                    String existingProducerId = entry.getValue().producerId();
                                    Long producerUserId = entry.getKey();

                                    return consumeAndResume(
                                            userId,
                                            new ConsumePayload(
                                                    newUserState.recvTransportId(),
                                                    existingProducerId,
                                                    newUserState.rtpCapabilities()
                                            )
                                    ).onErrorResume(e -> {
                                        log.warn("Failed to push existing producer {} (user {}) to new user {} in channel {}",
                                                existingProducerId, producerUserId, userId, channelId, e);
                                        return Mono.empty();
                                    });
                                })
                                .toList();

                        if (existingProducerConsumers.isEmpty()) {
                            return Mono.empty();
                        }

                        log.info("Pushing {} existing producers to new user {} in channel {}",
                                existingProducerConsumers.size(), userId, channelId);

                        return Flux.merge(existingProducerConsumers).then();
                    }))
                    .onErrorResume(e -> {
                        log.error("Orchestration failed for user {} in channel {}", userId, channelId, e);
                        voicePresenceService.userLeftChannel(serverId, channelId, userId);
                        return messagingService.sendError(userId, "Connection setup failed", e.getMessage());
                    });
        });
    }

    private void handleLeave(LeaveCmd cmd) {
        final Long userId = cmd.userId();
        final Long serverId = cmd.serverId();

        log.info("Processing leave for user {} in channel {} (serverId={})", userId, channelId, serverId);

        orchestratingUsers.remove(userId);
        UserState removed = userStates.remove(userId);

        if (removed != null) {
            lastActivityTime.set(System.currentTimeMillis());

            log.info("Closing mediasoup resources for user {} in channel {} ({} users remaining)",
                    userId, channelId, userStates.size());

            mediasoupClient.closeUserResources(channelId, userId)
                    .doOnSuccess(v -> {
                        if (serverId != null) {
                            voicePresenceService.userLeftChannel(serverId, channelId, userId);
                        }
                        log.info("User {} resources closed and presence removed from channel {}",
                                userId, channelId);
                    })
                    .onErrorResume(e -> {
                        log.warn("Failed to close mediasoup resources for user {} in channel {}: {}",
                                userId, channelId, e.getMessage());
                        if (serverId != null) {
                            voicePresenceService.userLeftChannel(serverId, channelId, userId);
                        }
                        return Mono.empty();
                    })
                    .subscribe();

            if (userStates.isEmpty()) {
                log.info("Channel {} is now empty, closing router", channelId);
                routerManager.ensureRouterClosedSync(false);
            }
        } else {
            log.warn("Leave command received for user {} in channel {} but user was not in actor state",
                    userId, channelId);
        }
    }

    private void handleHeartbeat(HeartbeatCmd cmd) {
        UserState updated = userStates.computeIfPresent(cmd.userId(), (key, state) -> state.updateHeartbeat());
        if (updated != null) {
            log.debug("Heartbeat updated for user {} in channel {}", cmd.userId(), channelId);
        } else {
            log.warn("Heartbeat received for unknown user {} in channel {}", cmd.userId(), channelId);
        }
    }

    private void handleConnectTransport(ConnectTransportCmd cmd) {
        if (!userStates.containsKey(cmd.userId())) {
            messagingService.sendError(cmd.userId(), "User not in channel", null).subscribe();
            return;
        }

        mediasoupClient.connectWebRtcTransport(channelId, cmd.userId(), cmd.payload())
                .flatMap(v -> messagingService.sendConnectResponse(
                        cmd.userId(), cmd.payload().getTransportId(), true, null))
                .onErrorResume(e -> messagingService.sendConnectResponse(
                        cmd.userId(), cmd.payload().getTransportId(), false, e.getMessage()))
                .subscribe();
    }

    private void handleProduce(ProduceCmd cmd) {
        if (!userStates.containsKey(cmd.userId())) {
            messagingService.sendError(cmd.userId(), "User not in channel", null).subscribe();
            return;
        }

        mediasoupClient.produce(channelId, cmd.userId(), cmd.payload())
                .flatMap(result -> {
                    String producerId = (String) result.get("id");

                    userStates.computeIfPresent(cmd.userId(), (key, state) ->
                            state.withProducerId(producerId));

                    Mono<Void> broadcastMono = messagingService
                            .broadcastNewProducer(channelId, cmd.userId(), producerId);

                    List<Mono<Void>> consumerCreations = userStates.entrySet().stream()
                            .filter(entry -> !entry.getKey().equals(cmd.userId()))
                            .filter(entry -> entry.getValue().recvTransportId() != null)
                            .filter(entry -> entry.getValue().rtpCapabilities() != null)
                            .map(entry -> {
                                Long consumerUserId = entry.getKey();
                                UserState state = entry.getValue();

                                return consumeAndResume(
                                        consumerUserId,
                                        new ConsumePayload(
                                                state.recvTransportId(),
                                                producerId,
                                                state.rtpCapabilities()
                                        )
                                ).onErrorResume(e -> {
                                    log.warn("Failed to create consumer for user {} from producer {} in channel {}",
                                            consumerUserId, cmd.userId(), channelId, e);
                                    return Mono.empty();
                                });
                            })
                            .toList();

                    return messagingService.sendProduceResponse(cmd.userId(), result)
                            .then(broadcastMono)
                            .then(Flux.merge(consumerCreations).then());
                })
                .onErrorResume(e -> messagingService.sendError(
                        cmd.userId(), "Failed to produce", e.getMessage()))
                .subscribe();
    }

    private void handleConsume(ConsumeCmd cmd) {
        if (!userStates.containsKey(cmd.userId())) {
            messagingService.sendError(cmd.userId(), "User not in channel", null).subscribe();
            return;
        }

        consumeAndResume(cmd.userId(), cmd.payload())
                .onErrorResume(e -> messagingService.sendError(
                        cmd.userId(), "Failed to consume", e.getMessage()))
                .subscribe();
    }

    private void handleMute(MuteCmd cmd) {
        UserState updated = userStates.computeIfPresent(cmd.userId(),
                (key, state) -> state.updateMute(cmd.muted()));

        if (updated != null) {
            voicePresenceService.updateMuteState(cmd.userId(), cmd.muted());
            messagingService.broadcastMuteStatus(channelId, cmd.userId(), cmd.muted()).subscribe();
        }
    }

    // ==================== Consumer Helper ====================

    private Mono<Void> consumeAndResume(Long consumerUserId, ConsumePayload payload) {
        return mediasoupClient.consume(channelId, consumerUserId, payload)
                .flatMap(consumeResult -> {
                    String consumerId = (String) consumeResult.get("id");
                    return mediasoupClient.resumeConsumer(channelId, consumerUserId, consumerId)
                            .thenReturn(consumeResult);
                })
                .flatMap(consumeResult ->
                        messagingService.sendConsumeResponse(consumerUserId, consumeResult));
    }

    // ==================== Periodic Tasks ====================

    private void cleanupInactiveUsers() {
        if (isDisposed.get()) {
            return;
        }

        List<Long> inactiveUsers = userStates.entrySet().stream()
                .filter(entry -> entry.getValue().isStale(heartbeatTimeout))
                .filter(entry -> !orchestratingUsers.containsKey(entry.getKey()))
                .map(Map.Entry::getKey)
                .toList();

        if (inactiveUsers.isEmpty()) {
            return;
        }

        log.info("Cleaning up {} inactive users in channel {}", inactiveUsers.size(), channelId);

        Flux.fromIterable(inactiveUsers)
                .flatMap(userId -> mediasoupClient.closeUserResources(channelId, userId)
                        .timeout(Duration.ofSeconds(5))
                        .thenReturn(userId)
                        .onErrorResume(e -> {
                            log.warn("Failed to close resources for inactive user {} in channel {}: {}",
                                    userId, channelId, e.getMessage());
                            return Mono.just(userId);
                        }))
                .collectList()
                .doOnSuccess(cleanedUserIds -> {
                    cleanedUserIds.forEach(userStates::remove);
                    cleanedUserIds.forEach(userChannelStateManager::removeUserState);

                    voicePresenceService.usersRemovedFromChannel(channelId, cleanedUserIds);

                    Flux.fromIterable(cleanedUserIds)
                            .flatMap(userId -> messagingService.broadcastUserLeft(channelId, userId)
                                    .onErrorResume(e -> {
                                        log.warn("[Actor] Failed to broadcast userLeft for stale user {} in channel {}: {}",
                                                userId, channelId, e.getMessage());
                                        return Mono.empty();
                                    }))
                            .subscribe();
                    if (userStates.isEmpty()) {
                        routerManager.ensureRouterClosedSync(false);
                    }
                })
                .subscribe();
    }

    private void checkHealth() {
        try {
            if (sink.currentSubscriberCount() == 0) {
                isHealthy.set(false);
            } else {
                isHealthy.compareAndSet(false, true);
            }
        } catch (Exception e) {
            isHealthy.set(false);
        }
    }

    // ==================== Lifecycle ====================

    public boolean isDisposed() {
        return isDisposed.get() || subscriptions.isDisposed();
    }

    public void dispose() {
        if (isDisposed.compareAndSet(false, true)) {
            log.info("Disposing actor for channel {}", channelId);

            isHealthy.set(false);

            CompletableFuture.runAsync(() -> {
                        try {
                            performDisposal();
                        } catch (Exception e) {
                            log.error("Error during disposal for channel {}", channelId, e);
                            forceCleanup();
                        }
                    }).orTimeout(10, TimeUnit.SECONDS)
                    .exceptionally(throwable -> {
                        log.error("Disposal timed out for channel {}, forcing cleanup", channelId);
                        forceCleanup();
                        return null;
                    });
        }
    }

    private void performDisposal() {
        log.info("Starting disposal operations for channel {}", channelId);

        int pending = capacityState.get().pendingCommands();
        if (pending > 0) {
            log.info("Waiting for {} pending commands to drain in channel {}", pending, channelId);
            long waited = 0;
            final long MAX_WAIT_TIME = 3000;

            while (capacityState.get().pendingCommands() > 0 && waited < MAX_WAIT_TIME) {
                try {
                    Thread.sleep(50);
                    waited += 50;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Interrupted while waiting for commands to drain in channel {}", channelId);
                    break;
                }
            }

            int remaining = capacityState.get().pendingCommands();
            if (remaining > 0) {
                log.warn("Disposing channel {} with {} pending commands still in queue",
                        channelId, remaining);
            }

            if (Thread.currentThread().isInterrupted()) {
                log.warn("Disposal interrupted for channel {}, proceeding with forced cleanup", channelId);
            }
        }

        List<Long> userIds = new ArrayList<>(userStates.keySet());
        if (!userIds.isEmpty()) {
            log.info("Closing Mediasoup resources for {} users in channel {}", userIds.size(), channelId);

            try {
                List<Mono<Void>> closeOperations = userIds.stream()
                        .map(userId -> mediasoupClient.closeUserResources(channelId, userId)
                                .timeout(Duration.ofSeconds(2))
                                .doOnSuccess(v -> log.debug("Closed resources for user {} in channel {}", userId, channelId))
                                .onErrorResume(e -> {
                                    log.warn("Failed to close Mediasoup resources for user {} in channel {}: {}",
                                            userId, channelId, e.getMessage());
                                    return Mono.empty();
                                }))
                        .toList();

                Flux.merge(closeOperations)
                        .then()
                        .block(Duration.ofSeconds(5));

                log.info("Mediasoup user resources cleanup completed for channel {}", channelId);
            } catch (Exception e) {
                log.error("Error during Mediasoup user resources cleanup for channel {}: {}",
                        channelId, e.getMessage());
            }

            voicePresenceService.usersRemovedFromChannel(channelId, userIds);
        }

        if (routerManager.isRouterCreated() || routerManager.isOperationInProgress()) {
            log.info("Closing Mediasoup router for channel {}", channelId);

            CompletableFuture<Void> routerCloseFuture = CompletableFuture.runAsync(() -> {
                try {
                    routerManager.forceClose().block(Duration.ofSeconds(4));
                } catch (Exception e) {
                    log.error("Error closing router during dispose for channel {}: {}", channelId, e.getMessage());
                }
            });

            try {
                routerCloseFuture.get(5, TimeUnit.SECONDS);
            } catch (TimeoutException e) {
                log.error("Router close timed out for channel {}, will force cleanup", channelId);
            } catch (Exception e) {
                log.error("Unexpected error waiting for router close for channel {}", channelId, e);
            }
        }

        if (!userIds.isEmpty()) {
            try {
                messagingService.broadcastChannelClosing(channelId, userIds)
                        .timeout(Duration.ofSeconds(1))
                        .onErrorResume(e -> {
                            log.debug("Failed to broadcast channel closing: {}", e.getMessage());
                            return Mono.empty();
                        })
                        .subscribe();
            } catch (Exception e) {
                log.debug("Error broadcasting channel closing: {}", e.getMessage());
            }
        }

        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        log.info("Disposing internal resources for channel {}", channelId);

        sink.tryEmitComplete();
        subscriptions.dispose();
        userStates.clear();
        orchestratingUsers.clear();
        routerManager.reset();
        capacityState.set(CapacityState.initial());

        log.info("Actor disposal completed for channel {} (users cleaned: {})", channelId, userIds.size());
    }

    private void forceCleanup() {
        log.warn("FORCE CLEANUP: Performing forced cleanup for channel {}", channelId);

        try {
            try {
                routerManager.forceClose().block(Duration.ofSeconds(2));
            } catch (Exception e) {
                log.warn("Force close router failed for channel {}", channelId);
            }

            List<Long> userIds = new ArrayList<>(userStates.keySet());
            for (Long userId : userIds) {
                try {
                    mediasoupClient.closeUserResources(channelId, userId)
                            .timeout(Duration.ofSeconds(1))
                            .onErrorResume(e -> Mono.empty())
                            .block(Duration.ofSeconds(1));
                } catch (Exception e) {
                    log.warn("Force close user resources failed for user {} in channel {}", userId, channelId);
                }
            }

            voicePresenceService.usersRemovedFromChannel(channelId, userIds);

            subscriptions.dispose();
            userStates.clear();
            orchestratingUsers.clear();
            routerManager.reset();
            capacityState.set(CapacityState.initial());

            try {
                sink.tryEmitComplete();
            } catch (Exception e) {
                // sink already completed
            }

            log.info("Force cleanup completed for channel {}", channelId);

        } catch (Exception e) {
            log.error("Force cleanup failed for channel {}", channelId, e);
        }
    }

    public boolean isHealthy() {
        return isHealthy.get() && !isDisposed.get();
    }
}