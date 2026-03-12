package dev.martinm.platform.voice;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class CapacityManager {
    private final RateLimiterRegistry rateLimiterRegistry;
    private final AtomicInteger totalPendingCommands = new AtomicInteger(0);

    @Value("${voice.capacity.maxGlobalPending:5000}")
    private int maxGlobalPendingCommands;

    @Value("${voice.ratelimiter.commands.limit:10}")
    private int commandRateLimit;

    @Value("${voice.ratelimiter.commands.period:1s}")
    private Duration commandRatePeriod;

    @Value("${voice.ratelimiter.heartbeat.limit:2}")
    private int heartbeatRateLimit;

    @Value("${voice.ratelimiter.heartbeat.period:1s}")
    private Duration heartbeatRatePeriod;

    @Getter
    private volatile boolean shuttingDown = false;

    private final Cache<Long, RateLimiter> commandLimiters = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .removalListener(this::onCommandLimiterRemoval)
            .recordStats()
            .build();

    private final Cache<Long, RateLimiter> heartbeatLimiters = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .removalListener(this::onHeartbeatLimiterRemoval)
            .recordStats()
            .build();

    public CapacityManager(RateLimiterRegistry rateLimiterRegistry) {
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    private void onCommandLimiterRemoval(Long userId, RateLimiter limiter, RemovalCause cause) {
        if (limiter != null && !shuttingDown) {
            String limiterName = "user-command-" + userId;
            try {
                rateLimiterRegistry.remove(limiterName);
                log.debug("Removed command rate limiter for user {} (cause: {})", userId, cause);
            } catch (Exception e) {
                log.warn("Error removing command rate limiter for user {}: {}", userId, e.getMessage());
            }
        }
    }

    private void onHeartbeatLimiterRemoval(Long userId, RateLimiter limiter, RemovalCause cause) {
        if (limiter != null && !shuttingDown) {
            String limiterName = "user-heartbeat-" + userId;
            try {
                rateLimiterRegistry.remove(limiterName);
                log.debug("Removed heartbeat rate limiter for user {} (cause: {})", userId, cause);
            } catch (Exception e) {
                log.warn("Error removing heartbeat rate limiter for user {}: {}", userId, e.getMessage());
            }
        }
    }

    public RateLimiter getCommandRateLimiter(Long userId) {
        return commandLimiters.get(userId, key ->
                rateLimiterRegistry.rateLimiter(
                        "user-command-" + key,
                        RateLimiterConfig.custom()
                                .limitForPeriod(commandRateLimit)
                                .limitRefreshPeriod(commandRatePeriod)
                                .timeoutDuration(Duration.ZERO)
                                .build()
                )
        );
    }

    public RateLimiter getHeartbeatRateLimiter(Long userId) {
        return heartbeatLimiters.get(userId, key ->
                rateLimiterRegistry.rateLimiter(
                        "user-heartbeat-" + key,
                        RateLimiterConfig.custom()
                                .limitForPeriod(heartbeatRateLimit)
                                .limitRefreshPeriod(heartbeatRatePeriod)
                                .timeoutDuration(Duration.ZERO)
                                .build()
                )
        );
    }

    public boolean checkCommandRateLimit(Long userId) {
        if (shuttingDown) {
            return false;
        }
        return getCommandRateLimiter(userId).acquirePermission();
    }

    public boolean checkHeartbeatRateLimit(Long userId) {
        if (shuttingDown) {
            return false;
        }
        return getHeartbeatRateLimiter(userId).acquirePermission();
    }

    public boolean acquireGlobalSlot() {
        if (shuttingDown) {
            log.debug("System is shutting down, rejecting command");
            return false;
        }

        for (int attempt = 0; attempt < 100; attempt++) {
            int current = totalPendingCommands.get();

            if (current >= maxGlobalPendingCommands) {
                if (attempt == 0) {
                    log.warn("Global capacity limit reached: {}/{}", current, maxGlobalPendingCommands);
                }
                return false;
            }

            if (totalPendingCommands.compareAndSet(current, current + 1)) {
                if (current > maxGlobalPendingCommands * 0.8) {
                    log.warn("High global capacity usage: {}/{}", current + 1, maxGlobalPendingCommands);
                }
                return true;
            }

            if (attempt > 0 && attempt % 10 == 0) {
                try {
                    Thread.sleep(Math.min(100, 1L << Math.min(attempt / 10, 5)));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Interrupted while waiting for capacity slot");
                    return false;
                }
            }
        }

        log.error("Failed to acquire global capacity slot after 100 attempts");
        return false;
    }

    public void releaseGlobalSlot() {
        int newValue = totalPendingCommands.decrementAndGet();

        if (newValue < 0) {
            log.error("Global pending commands went negative: {}. This should never happen!", newValue);
            totalPendingCommands.set(0);
        }
    }

    public void cleanupStaleLimiters() {
        log.info("Cleaning up stale rate limiters...");

        long beforeCommand = commandLimiters.estimatedSize();
        long beforeHeartbeat = heartbeatLimiters.estimatedSize();

        commandLimiters.cleanUp();
        heartbeatLimiters.cleanUp();

        long afterCommand = commandLimiters.estimatedSize();
        long afterHeartbeat = heartbeatLimiters.estimatedSize();

        log.info("Rate limiter cleanup: command {}->{}, heartbeat {}->{}",
                beforeCommand, afterCommand, beforeHeartbeat, afterHeartbeat);
    }

    public int getPendingCommands() {
        return totalPendingCommands.get();
    }

    public double getGlobalLoadFactor() {
        return (double) totalPendingCommands.get() / maxGlobalPendingCommands;
    }

    public boolean isOverloaded() {
        return totalPendingCommands.get() >= maxGlobalPendingCommands * 0.9;
    }

    public void shutdown() {
        log.info("CapacityManager shutting down. Pending commands: {}", totalPendingCommands.get());
        shuttingDown = true;

        log.info("Invalidating rate limiter caches...");
        commandLimiters.invalidateAll();
        heartbeatLimiters.invalidateAll();

        commandLimiters.cleanUp();
        heartbeatLimiters.cleanUp();

        log.info("Waiting briefly for rate limiter cleanup to complete...");
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted during rate limiter cleanup wait");
        }

        try {
            rateLimiterRegistry.getAllRateLimiters().forEach(limiter -> {
                String name = limiter.getName();
                if (name.startsWith("user-command-") || name.startsWith("user-heartbeat-")) {
                    try {
                        rateLimiterRegistry.remove(name);
                    } catch (Exception e) {
                        log.warn("Error removing rate limiter {}: {}", name, e.getMessage());
                    }
                }
            });
            log.info("Rate limiter cleanup completed");
        } catch (Exception e) {
            log.error("Error during rate limiter cleanup", e);
        }
    }

    public void reset() {
        totalPendingCommands.set(0);
        shuttingDown = false;
    }

    public CapacityStats getStats() {
        return new CapacityStats(
                totalPendingCommands.get(),
                maxGlobalPendingCommands,
                getGlobalLoadFactor(),
                isOverloaded(),
                shuttingDown,
                commandLimiters.estimatedSize(),
                heartbeatLimiters.estimatedSize()
        );
    }

    @PreDestroy
    public void preDestroy() {
        shutdown();
    }

    public record CapacityStats(
            int pendingCommands, int maxCapacity, double loadFactor, boolean overloaded,
            boolean shuttingDown, long commandLimitersCount, long heartbeatLimitersCount
    ) {}
}