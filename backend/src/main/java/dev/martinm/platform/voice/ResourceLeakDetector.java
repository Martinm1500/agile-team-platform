package dev.martinm.platform.voice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
@Slf4j
public class ResourceLeakDetector {
    private final CapacityManager capacityManager;
    private final ActorManager actorManager;
    private final UserChannelStateManager userChannelStateManager;

    private final AtomicLong lastLeakDetectionTime = new AtomicLong(0);
    private final AtomicLong consecutiveLeakDetections = new AtomicLong(0);

    // Umbrales configurables
    private static final double LIMITER_LEAK_THRESHOLD = 1.5;
    private static final int MAX_EXPECTED_LIMITERS_PER_ACTOR = 2;
    private static final int BASE_LIMITER_BUFFER = 1000;

    public ResourceLeakDetector(CapacityManager capacityManager,
                                ActorManager actorManager,
                                UserChannelStateManager userChannelStateManager) {
        this.capacityManager = capacityManager;
        this.actorManager = actorManager;
        this.userChannelStateManager = userChannelStateManager;
    }

    @Scheduled(fixedDelay = 300000, initialDelay = 300000)
    public void detectAndFixLeaks() {
        try {
            long startTime = System.currentTimeMillis();

            CapacityManager.CapacityStats capacity = capacityManager.getStats();
            ActorManager.ActorStats actors = actorManager.getStats();

            boolean leakDetected = false;

            if (detectCapacityLeak(capacity, actors)) {
                fixCapacityLeak(capacity);
                leakDetected = true;
            }

            if (detectRateLimiterLeak(capacity, actors)) {
                fixRateLimiterLeak(capacity);
                leakDetected = true;
            }

            if (detectZombieActors(actors)) {
                cleanupZombieActors();
                leakDetected = true;
            }

            if (detectSystemInconsistency(capacity, actors)) {
                logSystemInconsistency(capacity, actors);
                leakDetected = true;
            }

            if (detectOrphanedUserStates(actors)) {
                cleanupOrphanedUserStates();
                leakDetected = true;
            }

            updateLeakDetectionStats(leakDetected);

            if (actors.total() > 0 || capacity.pendingCommands() > 0 || leakDetected) {
                logSystemHealth(capacity, actors, startTime);
            }

        } catch (Exception e) {
            log.error("Critical error in leak detection - this should not happen", e);
            consecutiveLeakDetections.set(0);
        }
    }

    public LeakDetectionReport detectLeaksNow() {
        CapacityManager.CapacityStats capacity = capacityManager.getStats();
        ActorManager.ActorStats actors = actorManager.getStats();

        boolean capacityLeak = detectCapacityLeak(capacity, actors);
        boolean limiterLeak = detectRateLimiterLeak(capacity, actors);
        boolean zombieActors = detectZombieActors(actors);
        boolean systemInconsistency = detectSystemInconsistency(capacity, actors);
        boolean orphanedStates = detectOrphanedUserStates(actors);

        return new LeakDetectionReport(
                capacityLeak,
                limiterLeak,
                zombieActors,
                systemInconsistency,
                orphanedStates,
                capacity,
                actors
        );
    }

    // ==================== Detección de Leaks ====================

    private boolean detectCapacityLeak(CapacityManager.CapacityStats capacity,
                                       ActorManager.ActorStats actors) {
        return capacity.pendingCommands() > 0 && actors.total() == 0;
    }

    private boolean detectRateLimiterLeak(CapacityManager.CapacityStats capacity,
                                          ActorManager.ActorStats actors) {
        long totalLimiters = capacity.commandLimitersCount() + capacity.heartbeatLimitersCount();
        long expectedMaxLimiters = (long) actors.total() * MAX_EXPECTED_LIMITERS_PER_ACTOR + BASE_LIMITER_BUFFER;

        return totalLimiters > expectedMaxLimiters * LIMITER_LEAK_THRESHOLD;
    }

    private boolean detectZombieActors(ActorManager.ActorStats actors) {
        return actors.total() > 0 && (actors.total() - actors.healthy()) > 0;
    }

    private boolean detectSystemInconsistency(CapacityManager.CapacityStats capacity,
                                              ActorManager.ActorStats actors) {
        if (capacity.overloaded() && capacity.pendingCommands() < capacity.maxCapacity() * 0.5) {
            return true;
        }

        if (actors.idle() > actors.total() * 0.8 && actors.total() > 10) {
            return true;
        }

        if (actors.overloaded() > actors.total() * 0.5 && actors.total() > 5) {
            return true;
        }

        return false;
    }

    private boolean detectOrphanedUserStates(ActorManager.ActorStats actors) {
        return actors.total() == 0 && !userChannelStateManager.isEmpty();
    }

    // ==================== Corrección de Leaks ====================

    private void fixCapacityLeak(CapacityManager.CapacityStats capacity) {
        log.warn("⚠️ CAPACITY LEAK DETECTED: {} pending commands with no active actors - FIXING",
                capacity.pendingCommands());

        try {
            int orphanedStates = cleanupOrphanedUserStates();
            capacityManager.reset();

            log.info("✅ Capacity leak fixed: reset pending commands counter and cleaned {} orphaned user states",
                    orphanedStates);
        } catch (Exception e) {
            log.error("❌ Failed to fix capacity leak", e);
        }
    }

    private void fixRateLimiterLeak(CapacityManager.CapacityStats capacity) {
        long totalLimiters = capacity.commandLimitersCount() + capacity.heartbeatLimitersCount();

        log.warn("⚠️ RATE LIMITER LEAK DETECTED: {} total limiters " +
                        "(command: {}, heartbeat: {}) - FIXING",
                totalLimiters,
                capacity.commandLimitersCount(),
                capacity.heartbeatLimitersCount());

        try {
            capacityManager.cleanupStaleLimiters();

            CapacityManager.CapacityStats afterCleanup = capacityManager.getStats();
            long remainingLimiters = afterCleanup.commandLimitersCount() +
                    afterCleanup.heartbeatLimitersCount();

            log.info("✅ Rate limiter cleanup completed: {} -> {} limiters",
                    totalLimiters, remainingLimiters);

        } catch (Exception e) {
            log.error("❌ Failed to fix rate limiter leak", e);
        }
    }

    private void cleanupZombieActors() {
        ActorManager.ActorStats stats = actorManager.getStats();
        int zombies = stats.total() - stats.healthy();

        log.warn("⚠️ ZOMBIE ACTORS DETECTED: {} unhealthy actors out of {} total - FIXING",
                zombies, stats.total());

        try {
            actorManager.cleanupDeadActors();

            ActorManager.ActorStats afterCleanup = actorManager.getStats();
            int remainingZombies = afterCleanup.total() - afterCleanup.healthy();

            log.info("✅ Zombie actor cleanup completed: {} zombies removed, {} remaining",
                    zombies - remainingZombies, remainingZombies);

        } catch (Exception e) {
            log.error("❌ Failed to cleanup zombie actors", e);
        }
    }

    private int cleanupOrphanedUserStates() {
        try {
            int cleaned = userChannelStateManager.cleanupOrphanedStates(actorManager);

            if (cleaned > 0) {
                log.warn("⚠️ ORPHANED USER STATES DETECTED: cleaned {} orphaned states", cleaned);
            }

            return cleaned;
        } catch (Exception e) {
            log.error("❌ Failed to cleanup orphaned user states", e);
            return 0;
        }
    }

    private void logSystemInconsistency(CapacityManager.CapacityStats capacity,
                                        ActorManager.ActorStats actors) {
        log.warn("⚠️ SYSTEM INCONSISTENCY DETECTED:");

        if (capacity.overloaded() && capacity.pendingCommands() < capacity.maxCapacity() * 0.5) {
            log.warn("  - System marked overloaded but only {} / {} pending commands",
                    capacity.pendingCommands(), capacity.maxCapacity());
        }

        if (actors.idle() > actors.total() * 0.8 && actors.total() > 10) {
            log.warn("  - {} out of {} actors are idle ({}%)",
                    actors.idle(), actors.total(),
                    (actors.idle() * 100) / actors.total());
        }

        if (actors.overloaded() > actors.total() * 0.5 && actors.total() > 5) {
            log.warn("  - {} out of {} actors are overloaded ({}%)",
                    actors.overloaded(), actors.total(),
                    (actors.overloaded() * 100) / actors.total());
        }
    }

    // ==================== Estadísticas y Logging ====================

    private void updateLeakDetectionStats(boolean leakDetected) {
        if (leakDetected) {
            consecutiveLeakDetections.incrementAndGet();
            lastLeakDetectionTime.set(System.currentTimeMillis());

            long consecutive = consecutiveLeakDetections.get();
            if (consecutive >= 3) {
                log.error("🚨 CRITICAL: {} consecutive leak detections - system may be unstable",
                        consecutive);
            }
        } else {
            if (consecutiveLeakDetections.get() > 0) {
                log.info("✅ System stable - no leaks detected, resetting leak counter");
                consecutiveLeakDetections.set(0);
            }
        }
    }

    private void logSystemHealth(CapacityManager.CapacityStats capacity,
                                 ActorManager.ActorStats actors,
                                 long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        long totalLimiters = capacity.commandLimitersCount() + capacity.heartbeatLimitersCount();
        int userStates = userChannelStateManager.getUserStateCount();

        log.info("📊 Voice System Health Check ({} ms):", duration);
        log.info("  Actors: {} total ({} healthy, {} idle, {} overloaded)",
                actors.total(), actors.healthy(), actors.idle(), actors.overloaded());
        log.info("  Capacity: {} / {} pending ({:.1f}% load, {})",
                capacity.pendingCommands(),
                capacity.maxCapacity(),
                capacity.loadFactor() * 100,
                capacity.overloaded() ? "OVERLOADED" : "OK");
        log.info("  Rate Limiters: {} total ({} command, {} heartbeat)",
                totalLimiters,
                capacity.commandLimitersCount(),
                capacity.heartbeatLimitersCount());
        log.info("  User States: {} active", userStates);
        log.info("  System Status: {}",
                capacity.shuttingDown() ? "SHUTTING DOWN" : "ACTIVE");

        if (consecutiveLeakDetections.get() > 0) {
            log.info("  ⚠️ Consecutive leak detections: {}", consecutiveLeakDetections.get());
        }
    }

    // ==================== API Pública para Métricas ====================

    public long getConsecutiveLeakDetections() {
        return consecutiveLeakDetections.get();
    }

    public long getTimeSinceLastLeak() {
        long lastLeak = lastLeakDetectionTime.get();
        return lastLeak > 0 ? System.currentTimeMillis() - lastLeak : -1;
    }

    public boolean isSystemHealthy() {
        CapacityManager.CapacityStats capacity = capacityManager.getStats();
        ActorManager.ActorStats actors = actorManager.getStats();

        return !detectCapacityLeak(capacity, actors) &&
                !detectRateLimiterLeak(capacity, actors) &&
                !detectZombieActors(actors) &&
                !detectOrphanedUserStates(actors) &&
                consecutiveLeakDetections.get() == 0;
    }

    // ==================== DTOs ====================

    public record LeakDetectionReport(
            boolean capacityLeak, boolean rateLimiterLeak, boolean zombieActors, boolean systemInconsistency,
            boolean orphanedUserStates, CapacityManager.CapacityStats capacityStats, ActorManager.ActorStats actorStats
    ) {
        public boolean hasAnyLeak() {
            return capacityLeak || rateLimiterLeak || zombieActors ||
                    systemInconsistency || orphanedUserStates;
        }

        public String getSummary() {
            if (!hasAnyLeak()) {
                return "No leaks detected - system healthy";
            }

            StringBuilder sb = new StringBuilder("Leaks detected: ");
            if (capacityLeak) sb.append("CAPACITY ");
            if (rateLimiterLeak) sb.append("RATE_LIMITERS ");
            if (zombieActors) sb.append("ZOMBIE_ACTORS ");
            if (systemInconsistency) sb.append("INCONSISTENCY ");
            if (orphanedUserStates) sb.append("ORPHANED_STATES ");

            return sb.toString().trim();
        }
    }
}