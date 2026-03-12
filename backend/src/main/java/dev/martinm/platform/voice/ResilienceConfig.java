package dev.martinm.platform.voice;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.core.IntervalFunction;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Configuration
@Slf4j
public class ResilienceConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slowCallRateThreshold(50)
                .slowCallDurationThreshold(Duration.ofSeconds(5))
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(5)
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(50)
                .minimumNumberOfCalls(20)
                .recordExceptions(Exception.class, TimeoutException.class)
                .ignoreExceptions(IllegalArgumentException.class, IllegalStateException.class)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .writableStackTraceEnabled(false)
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);

        registry.getEventPublisher()
                .onEntryAdded(entryAddedEvent -> {
                    CircuitBreaker cb = entryAddedEvent.getAddedEntry();
                    log.info("CircuitBreaker {} added", cb.getName());

                    cb.getEventPublisher()
                            .onStateTransition(event ->
                                    log.warn("CircuitBreaker {} state: {} -> {}",
                                            event.getCircuitBreakerName(),
                                            event.getStateTransition().getFromState(),
                                            event.getStateTransition().getToState()))
                            .onCallNotPermitted(event ->
                                    log.warn("CircuitBreaker {} rejected call (circuit OPEN)",
                                            event.getCircuitBreakerName()))
                            .onSlowCallRateExceeded(event ->
                                    log.warn("CircuitBreaker {} slow call rate exceeded: {}%",
                                            event.getCircuitBreakerName(),
                                            event.getSlowCallRate()))
                            .onFailureRateExceeded(event ->
                                    log.error("CircuitBreaker {} failure rate exceeded: {}%",
                                            event.getCircuitBreakerName(),
                                            event.getFailureRate()))
                            .onError(event ->
                                    log.debug("CircuitBreaker {} call failed: {}",
                                            event.getCircuitBreakerName(),
                                            event.getThrowable().getMessage()))
                            .onSuccess(event ->
                                    log.trace("CircuitBreaker {} call succeeded",
                                            event.getCircuitBreakerName()));
                });

        return registry;
    }

    @Bean
    public CircuitBreaker mediasoupCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("mediasoup",
                CircuitBreakerConfig.custom()
                        .failureRateThreshold(60)
                        .slowCallRateThreshold(60)
                        .slowCallDurationThreshold(Duration.ofSeconds(8))
                        .waitDurationInOpenState(Duration.ofSeconds(45))
                        .permittedNumberOfCallsInHalfOpenState(3)
                        .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                        .slidingWindowSize(30)
                        .minimumNumberOfCalls(15)
                        .recordExceptions(Exception.class, TimeoutException.class)
                        .ignoreExceptions(IllegalArgumentException.class)
                        .automaticTransitionFromOpenToHalfOpenEnabled(true)
                        .writableStackTraceEnabled(false)
                        .build());
    }

    @Bean
    public RetryRegistry retryRegistry() {

        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .intervalFunction(
                        IntervalFunction.ofExponentialBackoff(500, 2.0, 5000))
                .retryOnException(throwable ->
                        !(throwable instanceof IllegalArgumentException ||
                                throwable instanceof IllegalStateException))
                .retryExceptions(TimeoutException.class, RuntimeException.class)
                .failAfterMaxAttempts(true)
                .build();

        RetryRegistry registry = RetryRegistry.of(config);

        registry.getEventPublisher()
                .onEntryAdded(entryAddedEvent -> {
                    var retry = entryAddedEvent.getAddedEntry();
                    log.info("Retry instance {} added", retry.getName());

                    retry.getEventPublisher()
                            .onRetry(event ->
                                    log.warn("Retry {} attempt {}/{}: {}",
                                            event.getName(),
                                            event.getNumberOfRetryAttempts(),
                                            config.getMaxAttempts(),
                                            event.getLastThrowable().getMessage()))
                            .onError(event ->
                                    log.error("Retry {} exhausted after {} attempts",
                                            event.getName(),
                                            event.getNumberOfRetryAttempts()));
                });

        return registry;
    }
}
