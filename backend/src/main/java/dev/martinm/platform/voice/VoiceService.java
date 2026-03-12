package dev.martinm.platform.voice;

import dev.martinm.platform.channels.Channel;
import dev.martinm.platform.channels.ChannelRepository;
import dev.martinm.platform.channels.ChannelType;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.users.User;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import dev.martinm.platform.voice.dto.*;
import dev.martinm.platform.voice.enums.JoinState;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
public class VoiceService {
    private final ChannelRepository channelRepository;
    private final ServerPermissionService serverPermissionService;
    private final UserChannelStateManager userChannelStateManager;
    private final VoicePresenceService voicePresenceService;

    @Getter
    private final VoiceMessagingService messagingService;
    @Getter
    private final MediasoupClient mediasoupClient;
    private final ActorManager actorManager;
    private final CapacityManager capacityManager;

    @Getter
    @Value("${voice.heartbeat.timeout:45000}")
    private long heartbeatTimeout;

    @Getter
    @Value("${voice.actor.maxMailboxSize:1000}")
    private int maxMailboxSize;

    private final Cache<Long, Channel> channelCache = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(1000)
            .recordStats()
            .build();

    public VoiceService(ChannelRepository channelRepository,
                        ServerPermissionService serverPermissionService,
                        UserChannelStateManager userChannelStateManager,
                        VoicePresenceService voicePresenceService,
                        VoiceMessagingService messagingService,
                        MediasoupClient mediasoupClient,
                        ActorManager actorManager,
                        CapacityManager capacityManager) {
        this.channelRepository = channelRepository;
        this.serverPermissionService = serverPermissionService;
        this.userChannelStateManager = userChannelStateManager;
        this.voicePresenceService = voicePresenceService;
        this.messagingService = messagingService;
        this.mediasoupClient = mediasoupClient;
        this.actorManager = actorManager;
        this.capacityManager = capacityManager;
    }

    // ==================== User Operations ====================

    /** Handle a user joining a voice channel. */
    public Mono<Void> handleJoin(Long channelId, User user) {
        if (capacityManager.isShuttingDown()) {
            return Mono.error(new IllegalStateException("System shutting down"));
        }

        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded. Please slow down."));
        }

        return Mono.defer(() -> {
            UserChannelState snapshot = userChannelStateManager.getUserChannelState(user.getId());
            if (snapshot != null && Objects.equals(snapshot.channelId(), channelId)) {
                return Mono.empty();
            }

            if (!userChannelStateManager.tryMarkProcessing(user.getId())) {
                return Mono.error(new IllegalStateException(
                        "Another operation is in progress for this user. Please try again."));
            }

            return performJoinOperation(channelId, user)
                    .doFinally(signal -> userChannelStateManager.unmarkProcessing(user.getId()));

        }).subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<Void> performJoinOperation(Long channelId, User user) {
        final AtomicReference<JoinState> joinState = new AtomicReference<>(JoinState.INITIAL);
        final AtomicReference<Long> previousChannel = new AtomicReference<>();
        final AtomicReference<Long> previousServer = new AtomicReference<>();
        final AtomicReference<Long> resolvedServerId = new AtomicReference<>();

        return userChannelStateManager.getUserChannel(user.getId())
                .flatMap(currentChannel -> {
                    previousChannel.set(currentChannel);
                    previousServer.set(userChannelStateManager.getUserServerSync(user.getId()));

                    if (Objects.equals(currentChannel, channelId)) {
                        return Mono.empty();
                    }

                    if (currentChannel != null) {
                        return performLeaveOperationUnlocked(user, currentChannel)
                                .doOnSuccess(v -> joinState.set(JoinState.LEFT_PREVIOUS))
                                .onErrorResume(e -> {
                                    joinState.set(JoinState.LEAVE_FAILED);
                                    return Mono.empty();
                                });
                    }

                    return Mono.empty();
                })
                .then(canAcceptCommand(channelId))
                .filter(canAccept -> canAccept)
                .switchIfEmpty(Mono.error(new IllegalStateException(
                        "Voice system busy. Please try again in a moment.")))
                .then(getChannelFromCacheOrDb(channelId))
                .flatMap(channel -> {
                    if (channel.getType() != ChannelType.VOICE) {
                        return Mono.error(new IllegalStateException("Can only join VOICE channels"));
                    }

                    return Mono.fromRunnable(() ->
                            serverPermissionService.checkServerPermission(
                                    channel.getServer().getId(),
                                    PermissionType.SEND_MESSAGES,
                                    user
                            )
                    ).thenReturn(channel);
                })
                .flatMap(channel -> {
                    resolvedServerId.set(channel.getServer().getId());
                    return sendWithCapacityControl(channelId,
                            new JoinCmd(channelId, user, resolvedServerId.get()))
                            .doOnSuccess(v -> joinState.set(JoinState.COMMAND_SENT))
                            .thenReturn(channelId);
                })
                .flatMap(cId -> {
                    joinState.set(JoinState.STATE_UPDATED);

                    return userChannelStateManager.tryUpdateUserChannel(
                            user.getId(),
                            previousChannel.get(),
                            cId,
                            resolvedServerId.get()
                    ).flatMap(success -> {
                        if (!success) {
                            return Mono.error(new IllegalStateException(
                                    "Channel state changed during join operation"));
                        }
                        joinState.set(JoinState.COMPLETED);
                        return Mono.just(cId);
                    });
                })
                .then()
                .onErrorResume(e -> performJoinRollback(
                        user.getId(), channelId, previousChannel.get(),
                        previousServer.get(), resolvedServerId.get(), joinState.get())
                        .then(messagingService.sendError(user.getId(), "Failed to join channel",
                                e.getMessage(), e instanceof IllegalStateException))
                        .then(Mono.error(e)))
                .timeout(Duration.ofSeconds(30));
    }

    private Mono<Void> performJoinRollback(Long userId,
                                           Long targetChannel,
                                           Long previousChannel,
                                           Long previousServer,
                                           Long targetServer,
                                           JoinState state) {
        return Mono.defer(() -> {
            if (state != JoinState.STATE_UPDATED && state != JoinState.COMMAND_SENT) {
                return Mono.empty();
            }

            return userChannelStateManager.getUserChannel(userId)
                    .flatMap(currentChannel -> {
                        if (currentChannel == null || Objects.equals(currentChannel, targetChannel)) {
                            return userChannelStateManager.tryUpdateUserChannel(
                                    userId, currentChannel, previousChannel, previousServer);
                        }
                        return Mono.just(false);
                    })
                    .defaultIfEmpty(false)
                    .then();
        }).onErrorResume(e -> Mono.empty());
    }

    /** Handle a user leaving a voice channel. */
    public Mono<Void> handleLeave(User user) {
        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded. Please slow down."));
        }

        return Mono.defer(() -> {
            if (!userChannelStateManager.tryMarkProcessing(user.getId())) {
                return Mono.error(new IllegalStateException(
                        "Another operation is in progress for this user. Please try again."));
            }

            return userChannelStateManager.getUserChannel(user.getId())
                    .flatMap(currentChannel -> {
                        if (currentChannel == null) {
                            log.debug("User {} requested leave but is not in any channel", user.getId());
                            return Mono.empty();
                        }
                        return performLeaveOperationUnlocked(user, currentChannel);
                    })
                    .doFinally(signal -> userChannelStateManager.unmarkProcessing(user.getId()));

        }).subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<Void> performLeaveOperationUnlocked(User user, Long channelId) {
        final Long serverId = userChannelStateManager.getUserServerSync(user.getId());
        log.info("User {} leaving channel {} (serverId={})", user.getId(), channelId, serverId);

        return canAcceptCommand(channelId)
                .filter(canAccept -> canAccept)
                .switchIfEmpty(Mono.error(new IllegalStateException("System busy, leave operation delayed")))
                .then(sendWithCapacityControl(channelId, new LeaveCmd(channelId, user.getId(), serverId)))
                .then(userChannelStateManager.tryUpdateUserChannel(user.getId(), channelId, null, null))
                .flatMap(success -> {
                    if (!success) {
                        log.warn("User {} state changed during leave from channel {}", user.getId(), channelId);
                    } else {
                        log.info("User {} state cleared after leaving channel {}", user.getId(), channelId);
                    }
                    return Mono.empty();
                })
                .then(messagingService.sendConnectionStateChanged(user.getId(), "idle", null))
                .doOnSuccess(v -> messagingService.broadcastUserLeft(channelId, user.getId()).subscribe())
                .onErrorResume(e -> {
                    log.warn("Leave operation failed for user {} in channel {}, forcing state cleanup: {}",
                            user.getId(), channelId, e.getMessage());
                    return userChannelStateManager
                            .tryUpdateUserChannel(user.getId(), channelId, null, null)
                            .then(messagingService.sendConnectionStateChanged(user.getId(), "idle", null));
                })
                .timeout(Duration.ofSeconds(15))
                .then();
    }

    public Mono<Void> heartbeat(User user) {
        if (!capacityManager.checkHeartbeatRateLimit(user.getId())) {
            return Mono.empty();
        }

        return Mono.fromCallable(() -> {
                    userChannelStateManager.updateHeartbeat(user.getId());
                    return userChannelStateManager.getUserChannelSync(user.getId());
                })
                .filter(Objects::nonNull)
                .flatMap(channelId -> sendHeartbeatCommand(channelId, user.getId()))
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> Mono.empty());
    }

    private Mono<Void> sendHeartbeatCommand(Long channelId, Long userId) {
        if (!capacityManager.acquireGlobalSlot()) {
            return Mono.empty();
        }

        return actorManager.getOrCreateActor(channelId)
                .flatMap(actor -> {
                    if (!actor.canAcceptCommand()) {
                        return Mono.empty();
                    }
                    return actor.send(new HeartbeatCmd(channelId, userId))
                            .timeout(Duration.ofSeconds(5));
                })
                .onErrorResume(e -> Mono.empty())
                .doFinally(signal -> capacityManager.releaseGlobalSlot());
    }

    // ==================== WebRTC Operations ====================

    public Mono<Void> handleConnectTransport(Long channelId, User user, ConnectTransportPayload payload) {
        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded"));
        }
        return userChannelStateManager.validateUserInChannel(user.getId(), channelId)
                .then(sendWithCapacityControl(channelId, new ConnectTransportCmd(channelId, user.getId(), payload)));
    }

    public Mono<Void> handleProduce(Long channelId, User user, ProducePayload payload) {
        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded"));
        }
        return userChannelStateManager.validateUserInChannel(user.getId(), channelId)
                .then(sendWithCapacityControl(channelId, new ProduceCmd(channelId, user.getId(), payload)));
    }

    public Mono<Void> handleConsume(Long channelId, User user, ConsumePayload payload) {
        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded"));
        }
        return userChannelStateManager.validateUserInChannel(user.getId(), channelId)
                .then(sendWithCapacityControl(channelId, new ConsumeCmd(channelId, user.getId(), payload)));
    }

    public Mono<Void> handleMute(Long channelId, User user, MutePayload payload) {
        if (!capacityManager.checkCommandRateLimit(user.getId())) {
            return Mono.error(new IllegalStateException("Rate limit exceeded"));
        }
        return userChannelStateManager.validateUserInChannel(user.getId(), channelId)
                .then(sendWithCapacityControl(channelId, new MuteCmd(channelId, user.getId(), payload.isMuted())));
    }

    public Mono<ReconnectionResponse> handleReconnection(Long channelId, User user) {
        return Mono.defer(() -> userChannelStateManager.getUserChannel(user.getId())
                        .flatMap(currentChannel -> {
                            if (!Objects.equals(currentChannel, channelId)) {
                                return Mono.error(new IllegalStateException("User not in channel"));
                            }
                            return mediasoupClient.getReconnectionData(channelId, user.getId());
                        })
                        .map(response -> {
                            ReconnectionResponse reconnectionResponse = new ReconnectionResponse();
                            reconnectionResponse.setOk((Boolean) response.get("ok"));
                            reconnectionResponse.setSendTransport((Map<String, Object>) response.get("sendTransport"));
                            reconnectionResponse.setRecvTransport((Map<String, Object>) response.get("recvTransport"));
                            reconnectionResponse.setRtpCapabilities((Map<String, Object>) response.get("rtpCapabilities"));
                            return reconnectionResponse;
                        })
                        .onErrorResume(e -> Mono.error(new RuntimeException("Failed to reconnect", e))))
                .timeout(Duration.ofSeconds(20));
    }

    // ==================== Internal Helper Methods ====================

    private Mono<Boolean> canAcceptCommand(Long channelId) {
        if (capacityManager.isShuttingDown()) {
            return Mono.just(false);
        }
        return actorManager.getOrCreateActor(channelId)
                .map(VoiceChannelActor::canAcceptCommand)
                .onErrorResume(e -> Mono.just(false));
    }

    private Mono<Void> sendWithCapacityControl(Long channelId, VoiceCommand command) {
        if (capacityManager.isShuttingDown()) {
            return Mono.error(new IllegalStateException("System shutting down"));
        }

        final AtomicBoolean slotAcquired = new AtomicBoolean(false);

        if (!capacityManager.acquireGlobalSlot()) {
            return Mono.error(new IllegalStateException(
                    "System temporarily overloaded. Please try again in a moment."));
        }
        slotAcquired.set(true);

        return actorManager.getOrCreateActor(channelId)
                .flatMap(actor -> {
                    if (!actor.canAcceptCommand()) {
                        return Mono.error(new IllegalStateException(
                                "Channel actor overloaded. Please try again."));
                    }
                    return actor.send(command);
                })
                .doFinally(signal -> {
                    if (slotAcquired.get()) {
                        capacityManager.releaseGlobalSlot();
                    }
                })
                .onErrorResume(e -> {
                    if (e instanceof IllegalStateException) {
                        return Mono.error(e);
                    }
                    return Mono.error(new RuntimeException("Failed to process command"));
                })
                .timeout(Duration.ofSeconds(15),
                        Mono.error(new IllegalStateException("Command timeout")));
    }

    private Mono<Channel> getChannelFromCacheOrDb(Long channelId) {
        return Mono.fromCallable(() ->
                channelCache.get(channelId, id ->
                        channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"))
                )
        ).subscribeOn(Schedulers.boundedElastic());
    }

    Mono<Void> closeUserResources(Long channelId, Long userId) {
        return mediasoupClient.closeUserResources(channelId, userId);
    }

    // ==================== Lifecycle ====================

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down VoiceService");

        capacityManager.shutdown();

        int pendingCommands = capacityManager.getPendingCommands();
        if (pendingCommands > 0) {
            log.info("Waiting for {} pending commands to drain...", pendingCommands);
            long waited = 0;
            while (capacityManager.getPendingCommands() > 0 && waited < 5000) {
                try {
                    Thread.sleep(100);
                    waited += 100;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            int remaining = capacityManager.getPendingCommands();
            if (remaining > 0) {
                log.warn("Shutdown proceeding with {} commands still pending", remaining);
            }
        }

        actorManager.shutdown();
        channelCache.invalidateAll();
        userChannelStateManager.clear();
        voicePresenceService.clear();

        log.info("VoiceService shutdown complete");
    }
}