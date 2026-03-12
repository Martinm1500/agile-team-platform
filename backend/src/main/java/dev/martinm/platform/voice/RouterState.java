package dev.martinm.platform.voice;

import java.time.Duration;
import java.time.Instant;

public record RouterState(
        boolean created, boolean operationInProgress, Instant lastOperationTime, int creationAttempts, boolean verified
) {
    public static final Duration DEFAULT_OPERATION_TIMEOUT = Duration.ofSeconds(10);
    public static final int DEFAULT_MAX_RETRIES = 3;

    public RouterState {
        if (creationAttempts < 0) {
            throw new IllegalArgumentException("Creation attempts cannot be negative: " + creationAttempts);
        }
        if (lastOperationTime == null) {
            lastOperationTime = Instant.EPOCH;
        }
    }

    public static RouterState initial() {
        return new RouterState(false, false, Instant.EPOCH, 0, false);
    }

    public RouterState startCreation() {
        return new RouterState(
                false, true, Instant.now(), creationAttempts + 1, false
        );
    }

    public RouterState finishCreation(boolean success) {
        return new RouterState(
                success, false, Instant.now(), success ? 0 : creationAttempts, success
        );
    }

    public RouterState startClosure() {
        return new RouterState(true, true, Instant.now(), 0, verified);
    }

    public RouterState finishClosure(boolean stillExists) {
        return new RouterState(
                stillExists, false, Instant.now(), 0, stillExists && verified
        );
    }

    public RouterState resetAfterTimeout() {
        return new RouterState(false, false, Instant.now(), creationAttempts, false);
    }

    // ===== Query Methods =====

    public boolean hasExceededRetries() {
        return hasExceededRetries(DEFAULT_MAX_RETRIES);
    }

    public boolean hasExceededRetries(int maxRetries) {
        return creationAttempts >= maxRetries;
    }

    public boolean isOperationTimedOut() {
        return isOperationTimedOut(DEFAULT_OPERATION_TIMEOUT);
    }

    public boolean isOperationTimedOut(Duration timeout) {
        if (!operationInProgress) {return false;}
        Duration elapsed = Duration.between(lastOperationTime, Instant.now());
        return elapsed.compareTo(timeout) > 0;
    }
}