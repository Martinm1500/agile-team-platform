package dev.martinm.platform.voice;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import jakarta.annotation.PreDestroy;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
@Service
@Slf4j
public class ActorManager {
    private final VoiceMessagingService messagingService;
    private final MediasoupClient mediasoupClient;
    private final VoicePresenceService voicePresenceService;
    private final UserChannelStateManager userChannelStateManager;

    @Getter
    @Value("${voice.heartbeat.timeout:45000}")
    private long heartbeatTimeout;

    @Getter
    @Value("${voice.actor.maxMailboxSize:1000}")
    private int maxMailboxSize;

    private final ConcurrentHashMap<Long, ActorHolder> actors = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, ReentrantLock> actorCreationLocks = new ConcurrentHashMap<>();

    private final Scheduler scheduler = Schedulers.newBoundedElastic(
            10,
            100,
            "voice-actor-manager"
    );

    private static final long ACTOR_HEALTH_CHECK_TIMEOUT_MS = 1000;
    private volatile boolean shuttingDown = false;

    public ActorManager(VoiceMessagingService messagingService,
                        MediasoupClient mediasoupClient,
                        VoicePresenceService voicePresenceService,
                        UserChannelStateManager userChannelStateManager) {
        this.messagingService = messagingService;
        this.mediasoupClient = mediasoupClient;
        this.voicePresenceService = voicePresenceService;
        this.userChannelStateManager = userChannelStateManager;
    }

    public Mono<VoiceChannelActor> getOrCreateActor(Long channelId) {
        if (shuttingDown) {
            return Mono.error(new IllegalStateException("ActorManager is shutting down"));
        }

        return Mono.fromCallable(() -> {
            ActorHolder existing = actors.get(channelId);
            if (existing != null && existing.isHealthy()) {
                VoiceChannelActor actor = existing.getActor();
                if (actor != null && actor.canAcceptCommand()) {
                    return actor;
                }
            }

            ReentrantLock creationLock = actorCreationLocks.computeIfAbsent(
                    channelId, k -> new ReentrantLock());

            if (!creationLock.tryLock(10, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Failed to acquire creation lock for channel " + channelId);
            }

            try {
                existing = actors.get(channelId);
                if (existing != null && existing.isHealthy()) {
                    VoiceChannelActor actor = existing.getActor();
                    if (actor != null && actor.canAcceptCommand()) {
                        return actor;
                    }
                }

                log.info("Creating new actor for channel {})", channelId);
                VoiceChannelActor newActor = new VoiceChannelActor(
                        channelId,
                        messagingService,
                        mediasoupClient,
                        voicePresenceService,
                        userChannelStateManager,
                        heartbeatTimeout,
                        maxMailboxSize,
                        scheduler
                );
                ActorHolder holder = new ActorHolder(newActor);

                if (waitForActorHealthy(newActor, channelId)) {
                    actors.put(channelId, holder);
                    log.info("Successfully created and registered actor for channel {}", channelId);
                    return newActor;
                }

                log.error("Actor failed to become healthy for channel {}, disposing", channelId);
                try {
                    newActor.dispose();
                } catch (Exception e) {
                    log.error("Failed to dispose unhealthy actor for channel {}: {}",
                            channelId, e.getMessage());
                }
                throw new IllegalStateException("Actor failed to become healthy for channel " + channelId);

            } finally {
                creationLock.unlock();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private boolean waitForActorHealthy(VoiceChannelActor actor, Long channelId) {
        if (actor.isHealthy() && actor.canAcceptCommand()) {
            return true;
        }

        long startWait = System.currentTimeMillis();
        while (System.currentTimeMillis() - startWait < ACTOR_HEALTH_CHECK_TIMEOUT_MS) {
            if (actor.isHealthy() && actor.canAcceptCommand()) {
                return true;
            }

            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for actor health for channel {}", channelId);
                return false;
            }
        }

        log.warn("Actor for channel {} did not become healthy within {}ms",
                channelId, ACTOR_HEALTH_CHECK_TIMEOUT_MS);
        return false;
    }

    public void removeActor(Long channelId) {
        ActorHolder removed = actors.remove(channelId);

        if (removed == null) {
            log.debug("No actor found to remove for channel {}", channelId);
            return;
        }

        if (!removed.markForDisposal()) {
            log.debug("Actor for channel {} already being disposed", channelId);
            return;
        }

        log.info("Removing and disposing actor for channel {}", channelId);

        try {
            removed.cleanup();
            log.info("Actor cleanup completed successfully for channel {}", channelId);
        } catch (Exception e) {
            log.error("Failed to cleanup actor for channel {}, forcing emergency cleanup",
                    channelId, e);
            try {
                removed.emergencyCleanup();
            } catch (Exception emergencyEx) {
                log.error("Emergency cleanup also failed for channel {}: {}",
                        channelId, emergencyEx.getMessage());
            }
        }
    }

    @Scheduled(fixedDelay = 30000, initialDelay = 30000)
    public void cleanupDeadActors() {
        if (shuttingDown) {
            return;
        }

        List<Long> toRemove = new ArrayList<>();

        actors.forEach((channelId, holder) -> {
            if (holder.isDisposed()) {
                toRemove.add(channelId);
                return;
            }

            VoiceChannelActor actor = holder.getActor();
            if (actor == null) {
                log.warn("Found holder with null actor for channel {}", channelId);
                toRemove.add(channelId);
                return;
            }

            if (actor.isDisposed()) {
                toRemove.add(channelId);
                return;
            }

            if (!holder.isDisposing() && actor.getActiveUsers() == 0 && actor.isIdle()) {
                toRemove.add(channelId);
            }
        });

        if (toRemove.isEmpty()) {
            return;
        }

        log.info("Cleaning up {} dead/idle actors", toRemove.size());

        int removedCount = 0;
        for (Long channelId : toRemove) {
            try {
                removeActor(channelId);
                removedCount++;
            } catch (Exception e) {
                log.error("Error removing actor for channel {}: {}", channelId, e.getMessage());
            }
        }

        if (removedCount > 0) {
            log.info("Cleaned up {} actors", removedCount);
        }
    }

    @Scheduled(fixedDelay = 60000, initialDelay = 60000)
    public void cleanupActorCreationLocks() {
        if (shuttingDown) {
            return;
        }

        Set<Long> activeChannels = new HashSet<>(actors.keySet());
        List<Long> toRemove = new ArrayList<>();

        actorCreationLocks.forEach((channelId, lock) -> {
            if (!activeChannels.contains(channelId) && lock.tryLock()) {
                try {
                    if (!actors.containsKey(channelId)) {
                        toRemove.add(channelId);
                    }
                } finally {
                    lock.unlock();
                }
            }
        });

        toRemove.forEach(actorCreationLocks::remove);

        if (!toRemove.isEmpty()) {
            log.debug("Cleaned up {} actor creation locks", toRemove.size());
        }
    }

    public ActorStats getStats() {
        int total = actors.size();
        int healthy = 0;
        int idle = 0;
        int overloaded = 0;

        for (ActorHolder holder : actors.values()) {
            if (holder.isHealthy()) {
                healthy++;
            }

            VoiceChannelActor actor = holder.getActor();
            if (actor != null) {
                if (actor.isIdle()) idle++;
                if (actor.isOverloaded()) overloaded++;
            }
        }

        return new ActorStats(total, healthy, idle, overloaded);
    }

    public boolean hasActor(Long channelId) {
        ActorHolder holder = actors.get(channelId);
        return holder != null && holder.isHealthy();
    }

    public Optional<VoiceChannelActor> getActor(Long channelId) {
        ActorHolder holder = actors.get(channelId);
        if (holder != null && holder.isHealthy()) {
            VoiceChannelActor actor = holder.getActor();
            if (actor != null && actor.canAcceptCommand()) {
                return Optional.of(actor);
            }
        }
        return Optional.empty();
    }

    @PreDestroy
    public void shutdown() {
        if (shuttingDown) {
            return;
        }

        log.info("Shutting down ActorManager with {} actors", actors.size());
        shuttingDown = true;

        List<Map.Entry<Long, ActorHolder>> actorList = new ArrayList<>(actors.entrySet());

        for (Map.Entry<Long, ActorHolder> entry : actorList) {
            Long channelId = entry.getKey();
            ActorHolder holder = entry.getValue();

            log.debug("Shutting down actor for channel {}", channelId);

            try {
                if (holder.markForDisposal()) {
                    holder.cleanup();
                }
            } catch (Exception e) {
                log.error("Error during shutdown cleanup for channel {}: {}",
                        channelId, e.getMessage());
                try {
                    holder.emergencyCleanup();
                } catch (Exception emergencyEx) {
                    log.error("Emergency cleanup failed during shutdown for channel {}: {}",
                            channelId, emergencyEx.getMessage());
                }
            }
        }

        actors.clear();
        actorCreationLocks.clear();
        scheduler.dispose();

        log.info("ActorManager shutdown complete");
    }

    public record ActorStats(
            int total, int healthy, int idle, int overloaded
    ) {}
}