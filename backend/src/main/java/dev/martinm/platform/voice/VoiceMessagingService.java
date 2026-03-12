package dev.martinm.platform.voice;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@AllArgsConstructor
public class VoiceMessagingService {
    private final SimpMessagingTemplate messagingTemplate;
    private final dev.martinm.platform.users.repository.UserRepository userRepository;

    public Mono<Void> sendToUser(Long userId, String destination, Object payload) {
        return Mono.fromCallable(() -> userRepository.findById(userId))
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(5))
                .flatMap(optionalUser -> optionalUser
                        .map(user -> Mono.fromRunnable(() -> {
                                    log.debug("Sending message to user {} at destination {}", userId, destination);
                                    messagingTemplate.convertAndSendToUser(user.getUsername(), destination, payload);
                                })
                                .subscribeOn(Schedulers.boundedElastic()))
                        .orElseGet(() -> {
                            log.warn("User {} not found, cannot send message", userId);
                            return Mono.empty();
                        }))
                .onErrorResume(e -> {
                    log.error("Error sending message to user {}", userId, e);
                    return Mono.empty();
                })
                .then();
    }

    public Mono<Void> sendRtpCapabilities(Long userId, Map<String, Object> rtpCapabilities) {
        return sendToUser(userId, "/queue/voice/rtpCapabilities", rtpCapabilities);
    }

    public Mono<Void> sendError(Long userId, String error, String details) {
        return sendError(userId, error, details, true);
    }

    public Mono<Void> sendError(Long userId, String error, String details, boolean retryable) {
        Map<String, Object> errorPayload = Map.of(
                "error", error,
                "details", details != null ? details : "",
                "retryable", retryable
        );
        return sendToUser(userId, "/queue/voice/error", errorPayload);
    }

    public Mono<Void> sendCreateSendTransport(Long userId, Map<String, Object> transport) {
        return sendToUser(userId, "/queue/voice/createSendTransport", transport);
    }

    public Mono<Void> sendCreateRecvTransport(Long userId, Map<String, Object> transport) {
        return sendToUser(userId, "/queue/voice/createRecvTransport", transport);
    }

    public Mono<Void> sendConnectResponse(Long userId, String transportId, boolean success, String error) {
        Map<String, Object> response = success
                ? Map.of("success", true, "transportId", transportId)
                : Map.of("success", false, "transportId", transportId, "error", error);

        return sendToUser(userId, "/queue/voice/connectResponse", response);
    }

    public Mono<Void> sendProduceResponse(Long userId, Map<String, Object> result) {
        return sendToUser(userId, "/queue/voice/produceResponse", result);
    }

    public Mono<Void> sendConsumeResponse(Long userId, Map<String, Object> result) {
        return sendToUser(userId, "/queue/voice/consume", result);
    }

    public Mono<Void> broadcast(Long channelId, String subtopic, Object payload) {
        return Mono.fromRunnable(() -> {
                    String destination = "/topic/voice/" + channelId + "/" + subtopic;
                    log.debug("Broadcasting to channel {} topic {}", channelId, subtopic);
                    messagingTemplate.convertAndSend(destination, payload);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Error broadcasting to channel {}", channelId, e);
                    return Mono.empty();
                })
                .then();
    }

    public Mono<Void> broadcastRaw(String destination, Object payload) {
        return Mono.fromRunnable(() -> {
                    log.debug("Broadcasting to destination {}", destination);
                    messagingTemplate.convertAndSend(destination, payload);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Error broadcasting to {}", destination, e);
                    return Mono.empty();
                })
                .then();
    }

    public Mono<Void> broadcastUserLeft(Long channelId, Long userId) {
        return broadcast(channelId, "userLeft", Map.of("userId", userId));
    }

    public Mono<Void> broadcastNewProducer(Long channelId, Long userId, Object producerId) {
        Map<String, Object> payload = Map.of(
                "userId", userId,
                "id", producerId
        );
        return broadcast(channelId, "newProducer", payload);
    }

    public Mono<Void> broadcastMuteStatus(Long channelId, Long userId, boolean muted) {
        Map<String, Object> payload = Map.of(
                "userId", userId,
                "muted", muted
        );
        return broadcast(channelId, "mute", payload);
    }

    public Mono<Void> broadcastChannelClosing(Long channelId, Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Mono.empty();
        }

        return Flux.fromIterable(userIds)
                .flatMap(userId ->
                        sendToUser(userId, "/topic/voice/channel-closing",
                                Map.of("channelId", channelId, "reason", "Channel is being closed"))
                                .onErrorResume(e -> {
                                    log.debug("Failed to notify user {} of channel closing: {}",
                                            userId, e.getMessage());
                                    return Mono.empty();
                                })
                )
                .then();
    }

    public Mono<Void> sendStartProducing(Long userId) {
        return sendToUser(userId, "/queue/voice/startProducing", Map.of("ready", true));
    }

    public Mono<Void> sendConnectionStateChanged(Long userId, String state, Long channelId) {
        Map<String, Object> event = new HashMap<>();
        event.put("state", state);
        event.put("channelId", channelId);
        return sendToUser(userId, "/queue/voice/connectionState", event);
    }
}