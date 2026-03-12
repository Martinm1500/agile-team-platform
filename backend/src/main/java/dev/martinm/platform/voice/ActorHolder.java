package dev.martinm.platform.voice;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
public class ActorHolder {
    private final AtomicReference<VoiceChannelActor> actorRef;
    private final AtomicReference<State> state = new AtomicReference<>(State.ACTIVE);
    private final AtomicReference<CompletableFuture<Void>> ongoingDisposal = new AtomicReference<>();

    ActorHolder(VoiceChannelActor actor) {
        this.actorRef = new AtomicReference<>(actor);
    }

    VoiceChannelActor getActor() {
        return actorRef.get();
    }

    boolean markForDisposal() {
        return state.compareAndSet(State.ACTIVE, State.DISPOSING);
    }

    boolean isDisposing() {
        return state.get() == State.DISPOSING;
    }

    void markDisposed() {
        State current = state.get();
        state.compareAndSet(current, State.DISPOSED);
    }

    boolean isDisposed() {
        return state.get() == State.DISPOSED;
    }

    boolean isHealthy() {
        VoiceChannelActor actor = actorRef.get();
        return state.get() == State.ACTIVE &&
                actor != null &&
                !actor.isDisposed() &&
                actor.isHealthy();
    }

    void cleanup() {
        VoiceChannelActor actor = actorRef.get();
        if (actor == null) {
            log.warn("Cleanup called on holder with null actor");
            markDisposed();
            return;
        }

        CompletableFuture<Void> disposeFuture = new CompletableFuture<>();
        CompletableFuture<Void> existing = ongoingDisposal.compareAndExchange(null, disposeFuture);

        if (existing != null) {
            log.debug("Disposal already in progress for channel {}, waiting for completion",
                    actor.getChannelId());
            try {
                existing.get(5, TimeUnit.SECONDS);
                return;
            } catch (TimeoutException e) {
                log.error("Existing disposal timed out for channel {}, forcing cleanup",
                        actor.getChannelId());
                forceCleanup(actor);
                return;
            } catch (Exception e) {
                log.warn("Existing disposal failed for channel {}: {}",
                        actor.getChannelId(), e.getMessage());
                forceCleanup(actor);
                return;
            }
        }

        try {
            log.debug("Starting actor disposal for channel {}", actor.getChannelId());
            actor.dispose();

            try {
                disposeFuture.get(5, TimeUnit.SECONDS);
                log.debug("Actor disposal completed successfully for channel {}", actor.getChannelId());
            } catch (TimeoutException e) {
                log.error("Actor dispose timed out after 5 seconds for channel {}, forcing cleanup",
                        actor.getChannelId());
                forceCleanup(actor);
            }

            disposeFuture.complete(null);

        } catch (Exception e) {
            log.error("Error disposing actor for channel {}: {}", actor.getChannelId(), e.getMessage());
            disposeFuture.completeExceptionally(e);
            forceCleanup(actor);
            throw new RuntimeException("Actor disposal failed", e);
        } finally {
            markDisposed();
            actorRef.set(null);
            ongoingDisposal.set(null);
        }
    }

    private void forceCleanup(VoiceChannelActor actor) {
        log.warn("FORCE CLEANUP: Forcing disposal for channel {}", actor.getChannelId());
        try {
            if (!actor.isDisposed()) {
                actor.dispose();
            }
        } catch (Exception e) {
            log.error("Force disposal failed for channel {}: {}",
                    actor.getChannelId(), e.getMessage());
        } finally {
            markDisposed();
            actorRef.set(null);
        }
    }

    void emergencyCleanup() {
        log.error("EMERGENCY CLEANUP initiated for holder");
        VoiceChannelActor actor = actorRef.getAndSet(null);

        if (actor != null) {
            try {
                actor.dispose();
            } catch (Exception e) {
                log.error("Emergency cleanup failed for channel {}: {}",
                        actor.getChannelId(), e.getMessage());
            }
        }

        markDisposed();
        ongoingDisposal.set(null);
    }

    private enum State { ACTIVE, DISPOSING, DISPOSED }

}