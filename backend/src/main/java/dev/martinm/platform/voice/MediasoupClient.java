package dev.martinm.platform.voice;

import dev.martinm.platform.voice.dto.ConnectTransportPayload;
import dev.martinm.platform.voice.dto.ConsumePayload;
import dev.martinm.platform.voice.dto.ProducePayload;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class MediasoupClient {
    private final WebClient webClient;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    @Value("${mediasoup.url:http://localhost:3000}")
    private String mediasoupUrl;

    @Value("${voice.webclient.timeout:10000}")
    private long webClientTimeout;

    @Value("${voice.webclient.retry.maxAttempts:3}")
    private int maxRetryAttempts;

    @Value("${voice.webclient.retry.backoff:1s}")
    private Duration retryBackoff;

    @Value("${voice.webclient.retry.maxBackoff:5s}")
    private Duration maxRetryBackoff;

    public MediasoupClient(WebClient webClient, CircuitBreakerRegistry circuitBreakerRegistry) {
        this.webClient = webClient;
        this.circuitBreakerRegistry = circuitBreakerRegistry;
    }

    private CircuitBreaker getCircuitBreaker() {
        return circuitBreakerRegistry.circuitBreaker("mediasoup");
    }

    public Mono<Map<String, Object>> getRtpCapabilities(Long channelId) {
        log.debug("Getting RTP capabilities for channel {}", channelId);

        return webClient.get()
                .uri(mediasoupUrl + "/getRouterRtpCapabilities/{channelId}", channelId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(webClientTimeout))
                .retryWhen(Retry.backoff(maxRetryAttempts, retryBackoff)
                        .maxBackoff(maxRetryBackoff)
                        .jitter(0.5)
                        .filter(throwable -> !(throwable instanceof IllegalArgumentException)))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(rtp -> log.debug("Successfully retrieved RTP capabilities for channel {}", channelId))
                .doOnError(e -> log.error("Failed to get RTP capabilities for channel {}", channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to get RTP capabilities", e));
    }

    public Mono<Void> createRouter(Long channelId) {
        log.info("Creating router for channel {}", channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/createRouter/{channelId}", channelId)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(webClientTimeout))
                .retryWhen(Retry.backoff(maxRetryAttempts, retryBackoff)
                        .maxBackoff(maxRetryBackoff))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(v -> log.info("Successfully created router for channel {}", channelId))
                .doOnError(e -> log.error("Failed to create router for channel {}", channelId, e))
                .onErrorResume(e -> Mono.empty())
                .then();
    }

    public Mono<Void> closeRouter(Long channelId) {
        log.info("Closing router for channel {}", channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/closeRouter/{channelId}", channelId)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(webClientTimeout))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(v -> log.info("Successfully closed router for channel {}", channelId))
                .doOnError(e -> log.error("Failed to close router for channel {}", channelId, e))
                .then();
    }

    public Mono<Void> closeUserResources(Long channelId, Long userId) {
        log.debug("Closing resources for user {} in channel {}", userId, channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/closeUserResources/{channelId}", channelId)
                .bodyValue(Map.of("userId", userId))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(webClientTimeout))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(v -> log.debug("Successfully closed resources for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.warn("Failed to close resources for user {} in channel {}", userId, channelId, e))
                .onErrorResume(e -> Mono.empty())
                .then();
    }

    public Mono<Map<String, Object>> createWebRtcTransport(Long channelId, Long userId,
                                                           boolean producing, boolean consuming) {
        log.debug("Creating WebRTC transport for user {} in channel {} (producing: {}, consuming: {})",
                userId, channelId, producing, consuming);

        return webClient.post()
                .uri(mediasoupUrl + "/createWebRtcTransport/{channelId}", channelId)
                .bodyValue(Map.of(
                        "userId", userId,
                        "producing", producing,
                        "consuming", consuming
                ))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(webClientTimeout))
                .retryWhen(Retry.backoff(maxRetryAttempts, retryBackoff)
                        .maxBackoff(maxRetryBackoff))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(transport -> log.debug("Successfully created transport for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.error("Failed to create transport for user {} in channel {}", userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to create transport", e));
    }

    public Mono<Void> connectWebRtcTransport(Long channelId, Long userId, ConnectTransportPayload payload) {
        log.debug("Connecting WebRTC transport {} for user {} in channel {}",
                payload.getTransportId(), userId, channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/connectWebRtcTransport/{channelId}", channelId)
                .bodyValue(Map.of(
                        "userId", userId,
                        "transportId", payload.getTransportId(),
                        "dtlsParameters", payload.getDtlsParameters()
                ))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(webClientTimeout))
                .retryWhen(Retry.backoff(maxRetryAttempts, retryBackoff)
                        .maxBackoff(maxRetryBackoff))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(v -> log.debug("Successfully connected transport for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.error("Failed to connect transport for user {} in channel {}", userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to connect transport", e))
                .then();
    }

    public Mono<Map<String, Object>> produce(Long channelId, Long userId, ProducePayload payload) {
        log.debug("Creating producer for user {} in channel {} (kind: {})",
                userId, channelId, payload.getKind());

        return webClient.post()
                .uri(mediasoupUrl + "/produce/{channelId}", channelId)
                .bodyValue(Map.of(
                        "transportId", payload.getTransportId(),
                        "kind", payload.getKind(),
                        "rtpParameters", payload.getRtpParameters(),
                        "userId", userId
                ))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(webClientTimeout))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(result -> log.debug("Successfully created producer for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.error("Failed to create producer for user {} in channel {}", userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to produce", e));
    }

    public Mono<Map<String, Object>> consume(Long channelId, Long userId, ConsumePayload payload) {
        log.debug("Creating consumer for user {} in channel {} (producer: {})",
                userId, channelId, payload.getProducerId());

        return webClient.post()
                .uri(mediasoupUrl + "/consume/{channelId}", channelId)
                .bodyValue(Map.of(
                        "transportId", payload.getTransportId(),
                        "producerId", payload.getProducerId(),
                        "rtpCapabilities", payload.getRtpCapabilities(),
                        "userId", userId
                ))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofMillis(webClientTimeout))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(result -> log.debug("Successfully created consumer for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.error("Failed to create consumer for user {} in channel {}", userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to consume", e));
    }

    public Mono<Void> resumeConsumer(Long channelId, Long userId, String consumerId) {
        log.debug("Resuming consumer {} for user {} in channel {}", consumerId, userId, channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/resumeConsumer/{channelId}", channelId)
                .bodyValue(Map.of(
                        "userId", userId,
                        "consumerId", consumerId
                ))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(webClientTimeout))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(v -> log.debug("Successfully resumed consumer {} for user {} in channel {}",
                        consumerId, userId, channelId))
                .doOnError(e -> log.warn("Failed to resume consumer {} for user {} in channel {}",
                        consumerId, userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to resume consumer", e))
                .then();
    }

    public Mono<Map<String, Object>> getReconnectionData(Long channelId, Long userId) {
        log.debug("Getting reconnection data for user {} in channel {}", userId, channelId);

        return webClient.post()
                .uri(mediasoupUrl + "/reconnect/{channelId}/{userId}", channelId, userId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(15))
                .transformDeferred(CircuitBreakerOperator.of(getCircuitBreaker()))
                .doOnSuccess(data -> log.debug("Successfully retrieved reconnection data for user {} in channel {}", userId, channelId))
                .doOnError(e -> log.error("Failed to get reconnection data for user {} in channel {}", userId, channelId, e))
                .onErrorMap(e -> new MediasoupException("Failed to reconnect", e));
    }
}