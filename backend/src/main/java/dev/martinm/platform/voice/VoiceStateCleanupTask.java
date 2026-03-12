package dev.martinm.platform.voice;

import dev.martinm.platform.voice.dto.StaleUserInfo;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
@AllArgsConstructor
public class VoiceStateCleanupTask {
    private final UserChannelStateManager userChannelStateManager;
    private final VoiceService voiceService;
    private final ActorManager actorManager;

    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private static final int MAX_CONSECUTIVE_FAILURES = 5;
    private static final int CLEANUP_TIMEOUT_SECONDS = 10;
    private static final int BROADCAST_TIMEOUT_SECONDS = 3;

    @Scheduled(fixedDelay = 60000, initialDelay = 60000)
    public void cleanupStaleUserStates() {
        try {
            long heartbeatTimeout = voiceService.getHeartbeatTimeout();
            List<StaleUserInfo> staleUsers = userChannelStateManager.findStaleUsers(heartbeatTimeout);

            if (!staleUsers.isEmpty()) {
                log.info("Found {} stale users to cleanup", staleUsers.size());
                cleanupStaleUsersWithResources(staleUsers);
            }

            consecutiveFailures.set(0);

        } catch (Exception e) {
            int failures = consecutiveFailures.incrementAndGet();
            log.error("Critical error in cleanup task (failure #{}) - this should not happen",
                    failures, e);

            if (failures >= MAX_CONSECUTIVE_FAILURES) {
                log.error("CRITICAL: {} consecutive cleanup failures - system may need restart",
                        failures);
            }
        }
    }

    private void cleanupStaleUsersWithResources(List<StaleUserInfo> staleUsers) {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        AtomicInteger criticalFailCount = new AtomicInteger(0);
        AtomicInteger channelNotFoundCount = new AtomicInteger(0);
        AtomicInteger alreadyCleanedCount = new AtomicInteger(0);

        Flux.fromIterable(staleUsers)
                .flatMap(staleUser -> {
                    log.debug("Cleaning up stale user {} from channel {}", staleUser.userId(), staleUser.channelId());

                    return validateChannelExists(staleUser.channelId())
                            .flatMap(channelExists -> {
                                if (!channelExists) {
                                    channelNotFoundCount.incrementAndGet();
                                    log.warn("Channel {} no longer exists, skipping resource cleanup for user {}",
                                            staleUser.channelId(), staleUser.userId());

                                    return Mono.fromRunnable(() ->
                                            userChannelStateManager.removeUserState(staleUser.userId()));
                                }

                                if (userChannelStateManager.getUserChannelState(staleUser.userId()) == null) {
                                    alreadyCleanedCount.incrementAndGet();
                                    log.debug("User {} already cleaned up by Actor, skipping",
                                            staleUser.userId());
                                    return Mono.empty();
                                }

                                return performFullCleanup(staleUser)
                                        .doOnSuccess(v -> successCount.incrementAndGet())
                                        .onErrorResume(e -> handleCleanupError(staleUser, e, failCount, criticalFailCount));
                            });
                })
                .then(Mono.fromRunnable(() -> {
                    if (successCount.get() > 0 || failCount.get() > 0 || alreadyCleanedCount.get() > 0) {
                        log.info("Stale user cleanup completed: {} succeeded, {} failed " +
                                        "({} critical, {} channel not found, {} already cleaned by Actor)",
                                successCount.get(), failCount.get(), criticalFailCount.get(),
                                channelNotFoundCount.get(), alreadyCleanedCount.get());

                        if (failCount.get() > staleUsers.size() / 2) {
                            log.warn("High cleanup failure rate: {}/{} - checking system health",
                                    failCount.get(), staleUsers.size());
                            checkSystemHealth();
                        }
                    }
                }))
                .subscribe();
    }

    private Mono<Boolean> validateChannelExists(Long channelId) {
        return actorManager.getActor(channelId)
                .map(actor -> !actor.isDisposed())
                .map(Mono::just)
                .orElse(Mono.just(false))
                .timeout(Duration.ofSeconds(2))
                .onErrorReturn(false);
    }

    private Mono<Void> performFullCleanup(StaleUserInfo staleUser) {
        return voiceService.closeUserResources(staleUser.channelId(), staleUser.userId())
                .timeout(Duration.ofSeconds(CLEANUP_TIMEOUT_SECONDS))
                .then(voiceService.getMessagingService()
                        .broadcastUserLeft(staleUser.channelId(), staleUser.userId())
                        .timeout(Duration.ofSeconds(BROADCAST_TIMEOUT_SECONDS))
                        .onErrorResume(e -> {
                            log.debug("Failed to broadcast user left for user {} in channel {}: {}",
                                    staleUser.userId(), staleUser.channelId(), e.getMessage());
                            return Mono.empty();
                        }))
                .then(Mono.fromRunnable(() ->
                        userChannelStateManager.removeUserState(staleUser.userId())))
                .doOnSuccess(v ->
                        log.debug("Successfully cleaned up stale user {} from channel {}",
                                staleUser.userId(), staleUser.channelId())).then();
    }

    private Mono<Void> handleCleanupError(StaleUserInfo staleUser, Throwable e,
                                          AtomicInteger failCount, AtomicInteger criticalFailCount) {
        failCount.incrementAndGet();

        if (e instanceof java.util.concurrent.TimeoutException) {
            criticalFailCount.incrementAndGet();
            log.error("TIMEOUT cleaning up user {} from channel {} - potential resource leak",
                    staleUser.userId(), staleUser.channelId());
        } else {
            log.warn("Cleanup failed for user {} in channel {}: {}",
                    staleUser.userId(), staleUser.channelId(), e.getMessage());
        }

        try {
            userChannelStateManager.removeUserState(staleUser.userId());
            log.debug("Removed user state for {} despite cleanup failure", staleUser.userId());
        } catch (Exception stateEx) {
            log.error("Failed to remove user state for {} after cleanup failure: {}",
                    staleUser.userId(), stateEx.getMessage());
        }

        return Mono.empty();
    }

    private void checkSystemHealth() {
        try {
            ActorManager.ActorStats stats = actorManager.getStats();
            log.info("System health check: {} total actors, {} healthy, {} idle",
                    stats.total(), stats.healthy(), stats.idle());

            if (stats.total() > 0 && stats.healthy() < stats.total() * 0.5) {
                log.error("CRITICAL: Less than 50% of actors are healthy ({}/{}) - " +
                                "manual intervention may be required",
                        stats.healthy(), stats.total());
            }

            if (stats.overloaded() > stats.total() * 0.3) {
                log.warn("WARNING: {}% of actors are overloaded ({}/{})",
                        (stats.overloaded() * 100) / stats.total(),
                        stats.overloaded(), stats.total());
            }
        } catch (Exception e) {
            log.error("Failed to check system health", e);
        }
    }
}