package dev.martinm.platform.voice;

public record CapacityState(int pendingCommands, boolean overloaded, long lastOverloadTime) {

    public CapacityState {
        if (pendingCommands < 0) {
            throw new IllegalArgumentException("Pending commands cannot be negative: " + pendingCommands);
        }
        if (lastOverloadTime < 0) {
            throw new IllegalArgumentException("Last overload time cannot be negative: " + lastOverloadTime);
        }
    }

    public static CapacityState initial() {
        return new CapacityState(0, false, 0);
    }

    public CapacityState incrementCommands(int maxMailboxSize) {
        validateMaxMailboxSize(maxMailboxSize);

        if (pendingCommands >= maxMailboxSize) {
            throw new IllegalStateException(
                    "Cannot increment: already at capacity (" + pendingCommands + "/" + maxMailboxSize + ")"
            );
        }

        int newPending = pendingCommands + 1;
        boolean nowOverloaded = newPending >= maxMailboxSize;

        return new CapacityState(
                newPending, nowOverloaded, nowOverloaded ? System.currentTimeMillis() : lastOverloadTime
        );
    }

    public CapacityState decrementCommands(int maxMailboxSize) {
        validateMaxMailboxSize(maxMailboxSize);

        int newPending = Math.max(0, pendingCommands - 1);
        boolean stillOverloaded = newPending >= (maxMailboxSize * 0.7);

        return new CapacityState(
                newPending, stillOverloaded, stillOverloaded ? lastOverloadTime : 0
        );
    }

    private void validateMaxMailboxSize(int maxMailboxSize) {
        if (maxMailboxSize <= 0) {
            throw new IllegalArgumentException("Max mailbox size must be positive: " + maxMailboxSize);
        }
    }
}