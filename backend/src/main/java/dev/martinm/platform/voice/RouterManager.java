package dev.martinm.platform.voice;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
public class RouterManager {
    private final Long channelId;
    private final MediasoupClient mediasoupClient;
    private final AtomicReference<RouterState> routerState = new AtomicReference<>(RouterState.initial());

    private static final Duration ROUTER_OPERATION_TIMEOUT = Duration.ofSeconds(8);

    private static final int MAX_RETRY_ATTEMPTS = 10;
    private static final Duration RETRY_DELAY = Duration.ofMillis(50);

    public RouterManager(Long channelId, MediasoupClient mediasoupClient) {
        this.channelId = channelId;
        this.mediasoupClient = mediasoupClient;
    }

    public Mono<Void> ensureRouterCreated() {
        return Mono.defer(() -> {
                    RouterState current = routerState.get();

                    if (current.created() && current.verified()) {
                        return Mono.empty();
                    }

                    if (current.hasExceededRetries()) {
                        log.warn("Router creation max retries exceeded for channel {}", channelId);
                        return Mono.empty();
                    }

                    if (current.isOperationTimedOut()) {
                        if (routerState.compareAndSet(current, current.resetAfterTimeout())) {
                            log.warn("Router creation timed out for channel {}, resetting state", channelId);
                        }
                        return ensureRouterCreated();
                    }

                    if (current.operationInProgress()) {
                        return Mono.delay(RETRY_DELAY)
                                .then(Mono.defer(this::ensureRouterCreated));
                    }

                    RouterState creating = current.startCreation();
                    if (routerState.compareAndSet(current, creating)) {
                        return performRouterCreation();
                    }

                    // CAS falló (otro thread ganó): reintentar
                    return Mono.defer(this::ensureRouterCreated);
                })
                .retry(MAX_RETRY_ATTEMPTS)
                .onErrorResume(e -> {
                    log.error("Failed to ensure router created for channel {}: {}", channelId, e.getMessage());
                    return Mono.empty();
                });
    }

    public Mono<Void> ensureRouterClosed(boolean hasUsers) {
        return Mono.defer(() -> {
            RouterState current = routerState.get();

            if (!current.created()) {
                return Mono.empty();
            }

            if (hasUsers) {
                return Mono.empty();
            }

            if (current.operationInProgress()) {
                return Mono.delay(RETRY_DELAY)
                        .then(Mono.defer(() -> ensureRouterClosed(hasUsers)));
            }

            RouterState closing = current.startClosure();
            if (routerState.compareAndSet(current, closing)) {
                return performRouterClosure(hasUsers);
            }

            return Mono.defer(() -> ensureRouterClosed(hasUsers));
        });
    }

    public void ensureRouterCreatedSync() {
        ensureRouterCreated().subscribe(
                null,
                e -> log.error("ensureRouterCreated failed for channel {}: {}", channelId, e.getMessage())
        );
    }

    public void ensureRouterClosedSync(boolean hasUsers) {
        ensureRouterClosed(hasUsers).subscribe(
                null,
                e -> log.error("ensureRouterClosed failed for channel {}: {}", channelId, e.getMessage())
        );
    }

    public void checkAndHandleTimeout(boolean hasUsers) {
        RouterState current = routerState.get();

        if (current.isOperationTimedOut()) {
            RouterState reset = current.resetAfterTimeout();
            if (routerState.compareAndSet(current, reset)) {
                log.warn("Router operation timed out for channel {}, state reset", channelId);

                if (hasUsers && !reset.created()) {
                    ensureRouterCreatedSync();
                }
            }
        }
    }

    public Mono<Void> forceClose() {
        RouterState current = routerState.get();

        if (!current.created() && !current.operationInProgress()) {
            return Mono.empty();
        }

        log.info("Force closing router for channel {}", channelId);

        return mediasoupClient.closeRouter(channelId)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(v -> {
                    routerState.set(RouterState.initial());
                    log.info("Router force closed successfully for channel {}", channelId);
                })
                .onErrorResume(e -> {
                    log.error("Failed to force close router for channel {}: {}",
                            channelId, e.getMessage());
                    routerState.set(RouterState.initial());
                    return Mono.empty();
                });
    }

    public RouterState getState() {
        return routerState.get();
    }

    public boolean isRouterCreated() {
        RouterState current = routerState.get();
        return current.created() && current.verified();
    }

    public boolean isOperationInProgress() {
        return routerState.get().operationInProgress();
    }

    public void reset() {
        routerState.set(RouterState.initial());
    }

    // ==================== Private Helpers ====================

    private Mono<Void> performRouterCreation() {
        log.debug("Starting router creation for channel {}", channelId);

        return mediasoupClient.createRouter(channelId)
                .timeout(ROUTER_OPERATION_TIMEOUT)
                .doOnSuccess(v -> updateCreationState(true))
                .doOnError(error -> {
                    log.error("Router creation failed for channel {}: {}", channelId, error.getMessage());
                    updateCreationState(false);
                })
                .onErrorResume(e -> Mono.empty());
    }

    private void updateCreationState(boolean success) {
        while (true) {
            RouterState current = routerState.get();
            RouterState updated = current.finishCreation(success);
            if (routerState.compareAndSet(current, updated)) {
                if (success) {
                    log.info("Router created successfully for channel {}", channelId);
                } else {
                    log.warn("Router creation failed for channel {}, attempts: {}",
                            channelId, current.creationAttempts());
                }
                break;
            }
        }
    }

    private Mono<Void> performRouterClosure(boolean hasUsers) {
        log.debug("Starting router closure for channel {}", channelId);

        return mediasoupClient.closeRouter(channelId)
                .timeout(ROUTER_OPERATION_TIMEOUT)
                .doOnSuccess(v -> updateClosureState(hasUsers))
                .doOnError(error -> {
                    log.error("Router closure failed for channel {}: {}", channelId, error.getMessage());
                    updateClosureState(true);
                })
                .onErrorResume(e -> Mono.empty());
    }

    private void updateClosureState(boolean stillExists) {
        while (true) {
            RouterState current = routerState.get();
            RouterState updated = current.finishClosure(stillExists);
            if (routerState.compareAndSet(current, updated)) {
                if (!stillExists) {
                    log.info("Router closed successfully for channel {}", channelId);
                } else {
                    log.debug("Router closure aborted for channel {} (users present)", channelId);
                }
                break;
            }
        }
    }

    public RouterStats getStats() {
        RouterState state = routerState.get();
        return new RouterStats(
                state.created(),
                state.verified(),
                state.operationInProgress(),
                state.creationAttempts(),
                state.isOperationTimedOut()
        );
    }

    public record RouterStats(
            boolean created, boolean verified, boolean operationInProgress,
            int creationAttempts, boolean timedOut
    ) {}
}