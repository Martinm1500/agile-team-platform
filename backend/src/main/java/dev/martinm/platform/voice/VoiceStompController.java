package dev.martinm.platform.voice;

import dev.martinm.platform.users.User;
import dev.martinm.platform.voice.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import jakarta.annotation.PreDestroy;
import jakarta.validation.Valid;

import java.security.Principal;
import java.time.Duration;
import java.util.Map;

@Controller
@Slf4j
@Validated
public class VoiceStompController {
    private final VoiceService voiceService;
    private final SimpMessagingTemplate messagingTemplate;
    private final VoiceMessagingService messagingService;
    private final VoicePresenceService voicePresenceService;

    public VoiceStompController(
            VoiceService voiceService,
            SimpMessagingTemplate messagingTemplate,
            VoiceMessagingService messagingService,
            VoicePresenceService voicePresenceService) {
        this.voiceService = voiceService;
        this.messagingTemplate = messagingTemplate;
        this.messagingService = messagingService;
        this.voicePresenceService = voicePresenceService;
    }

    // ==================== Join / Leave / Heartbeat ====================

    @MessageMapping("/voice/join/{channelId}")
    public void join(@DestinationVariable Long channelId, Principal principal) {
        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleJoin(channelId, user)
                        .doOnSuccess(v -> log.info("User {} joined channel {}", user.getId(), channelId))
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(),
                                "/queue/voice/error",
                                Map.of(
                                        "error", determineErrorMessage(e),
                                        "operation", "join",
                                        "channelId", channelId,
                                        "timestamp", System.currentTimeMillis()
                                )
                        ))
                )
                .timeout(Duration.ofSeconds(30))
                .onErrorResume(e -> {
                    log.error("Join failed for channel {}: {}", channelId, e.getMessage());
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/leave")
    public void leave(Principal principal) {
        extractUserMono(principal)
                .flatMap(user -> voiceService.handleLeave(user)
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(),
                                "/queue/voice/error",
                                Map.of(
                                        "error", "Failed to leave channel",
                                        "operation", "leave",
                                        "timestamp", System.currentTimeMillis()
                                )
                        ))
                )
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(e -> {
                    log.error("Leave failed: {}", e.getMessage());
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/heartbeat")
    public void heartbeat(Principal principal) {
        extractUserMono(principal)
                .flatMap(voiceService::heartbeat)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.debug("Heartbeat failed: {}", e.getMessage());
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    // ==================== Presence ====================

    @MessageMapping("/voice/presence/{serverId}/subscribe")
    public void subscribePresence(
            @DestinationVariable Long serverId,
            Principal principal) {

        if (serverId == null || serverId <= 0) {
            sendErrorToUser(principal, "Invalid server ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user ->
                        reactor.core.publisher.Mono.fromCallable(() ->
                                        voicePresenceService.getServerPresence(serverId))
                                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                                .doOnSuccess(presence -> {
                                    messagingTemplate.convertAndSendToUser(
                                            user.getUsername(),
                                            "/queue/voice/presence/" + serverId,
                                            presence
                                    );
                                    log.debug("Sent presence snapshot for server {} to user {}",
                                            serverId, user.getId());
                                })
                                .onErrorResume(e -> {
                                    log.error("Error sending presence snapshot to user {} for server {}: {}",
                                            user.getId(), serverId, e.getMessage());
                                    sendErrorToUser(user, "Failed to load voice presence");
                                    return reactor.core.publisher.Mono.empty();
                                })
                )
                .onErrorResume(e -> {
                    log.error("subscribePresence auth error: {}", e.getMessage());
                    sendErrorToUser(principal, "Authentication error");
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    // ==================== Transport / Media ====================

    @MessageMapping("/voice/connectTransport/{channelId}")
    public void connectTransport(
            @DestinationVariable Long channelId,
            @Payload @Valid ConnectTransportPayload payload,
            Principal principal) {

        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleConnectTransport(channelId, user, payload)
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/error",
                                Map.of("error", "Failed to connect transport",
                                        "operation", "connectTransport",
                                        "channelId", channelId,
                                        "transportId", payload.getTransportId(),
                                        "timestamp", System.currentTimeMillis())))
                )
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(e -> {
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/reconnect/{channelId}")
    public void reconnect(@DestinationVariable Long channelId, Principal principal) {
        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleReconnection(channelId, user)
                        .flatMap(response -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/reconnectResponse", response))
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/error",
                                Map.of("error", "Failed to reconnect",
                                        "operation", "reconnect",
                                        "channelId", channelId,
                                        "timestamp", System.currentTimeMillis())))
                )
                .timeout(Duration.ofSeconds(30))
                .onErrorResume(e -> {
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/produce/{channelId}")
    public void produce(
            @DestinationVariable Long channelId,
            @Payload @Valid ProducePayload payload,
            Principal principal) {

        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleProduce(channelId, user, payload)
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/error",
                                Map.of("error", "Failed to produce media",
                                        "operation", "produce",
                                        "channelId", channelId,
                                        "timestamp", System.currentTimeMillis())))
                )
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(e -> {
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/consume/{channelId}")
    public void consume(
            @DestinationVariable Long channelId,
            @Payload @Valid ConsumePayload payload,
            Principal principal) {

        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleConsume(channelId, user, payload)
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/error",
                                Map.of("error", "Failed to consume media",
                                        "operation", "consume",
                                        "channelId", channelId,
                                        "timestamp", System.currentTimeMillis())))
                )
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(e -> {
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    @MessageMapping("/voice/mute/{channelId}")
    public void mute(
            @DestinationVariable Long channelId,
            @Payload @Valid MutePayload payload,
            Principal principal) {

        if (channelId == null || channelId <= 0) {
            sendErrorToUser(principal, "Invalid channel ID");
            return;
        }

        extractUserMono(principal)
                .flatMap(user -> voiceService.handleMute(channelId, user, payload)
                        .onErrorResume(e -> messagingService.sendToUser(
                                user.getId(), "/queue/voice/error",
                                Map.of("error", "Failed to update mute status",
                                        "operation", "mute",
                                        "channelId", channelId,
                                        "timestamp", System.currentTimeMillis())))
                )
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(e -> {
                    sendErrorToUser(principal, determineErrorMessage(e));
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }

    // ==================== Helpers ====================

    private reactor.core.publisher.Mono<User> extractUserMono(Principal principal) {
        return reactor.core.publisher.Mono.fromCallable(() -> extractUser(principal))
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                .onErrorMap(e -> new IllegalStateException("Authentication error: " + e.getMessage()));
    }

    private User extractUser(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Principal is null");
        }
        if (principal instanceof Authentication auth) {
            Object principalObj = auth.getPrincipal();
            if (principalObj instanceof User user) {
                return user;
            }
            throw new IllegalStateException(
                    "Principal is not a User instance: " + principalObj.getClass().getName());
        }
        throw new IllegalStateException(
                "Principal is not an Authentication instance: " + principal.getClass().getName());
    }

    private String determineErrorMessage(Throwable e) {
        String message = e.getMessage();
        if (e instanceof java.util.concurrent.TimeoutException) {
            return "Operation timed out, please try again";
        } else if (e instanceof IllegalStateException) {
            return "Invalid state: " + message;
        } else if (e instanceof IllegalArgumentException) {
            return "Invalid parameters: " + message;
        } else if (message != null && message.contains("not found")) {
            return "Resource not found";
        } else if (message != null && message.contains("permission")) {
            return "Insufficient permissions";
        } else {
            return "An error occurred, please try again";
        }
    }

    private void sendErrorToUser(Principal principal, String errorMessage) {
        try {
            User user = extractUser(principal);
            sendErrorToUser(user, errorMessage);
        } catch (Exception e) {
            log.error("Failed to send error to user: {}", e.getMessage());
        }
    }

    private void sendErrorToUser(User user, String errorMessage) {
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getUsername(),
                    "/queue/voice/error",
                    Map.of("error", errorMessage, "timestamp", System.currentTimeMillis())
            );
        } catch (Exception e) {
            log.error("Failed to send error message to user {}: {}", user.getId(), e.getMessage());
        }
    }

    // FIX: @PreDestroy ya no necesita apagar ningún executor manual
    @PreDestroy
    public void shutdown() {
        log.info("VoiceStompController shutdown - nothing to dispose");
    }
}