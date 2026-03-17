package dev.martinm.platform.messages;

import dev.martinm.platform.auth.TokenBlacklistService;
import dev.martinm.platform.security.JwtService;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;

@Component
public class UserInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(UserInterceptor.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public UserInterceptor(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            TokenBlacklistService tokenBlacklistService,
            UserRepository userRepository,
            @Lazy SimpMessagingTemplate messagingTemplate
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Nullable
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            return handleConnect(accessor, message);
        }

        if (StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            return handleAuthenticatedCommand(accessor, message);
        }

        return message;
    }

    // ==================== Handlers ====================

    private Message<?> handleConnect(StompHeaderAccessor accessor, Message<?> message) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No Authorization header in WebSocket CONNECT");
            return null;
        }

        String jwt = authHeader.substring(7);

        try {
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Blacklisted token used in WebSocket CONNECT");
                return null;
            }

            String username = jwtService.extractUsername(jwt);

            if (username == null) {
                logger.warn("Could not extract username from JWT on CONNECT");
                return null;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(jwt, userDetails)) {
                logger.warn("Invalid or expired JWT for WebSocket user {}", username);
                return null;
            }

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // JWT guardado en credentials para poder re-validarlo en mensajes posteriores
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user,
                    jwt,
                    userDetails.getAuthorities()
            );

            accessor.setUser(authentication);

            logger.debug("WebSocket authenticated user {}", username);
            return message;

        } catch (ExpiredJwtException e) {
            logger.warn("Expired JWT on CONNECT - client should refresh token first");
            return null;

        } catch (Exception e) {
            logger.warn("WebSocket authentication failed on CONNECT: {}", e.getMessage());
            return null;
        }
    }

    private Message<?> handleAuthenticatedCommand(StompHeaderAccessor accessor, Message<?> message) {
        Principal principal = accessor.getUser();

        if (principal == null) {
            logger.warn("Unauthenticated STOMP {} rejected - no principal", accessor.getCommand());
            return null;
        }

        if (!(principal instanceof Authentication auth)) {
            logger.warn("Invalid principal type: {}", principal.getClass().getName());
            return null;
        }

        Object principalObj = auth.getPrincipal();

        if (!(principalObj instanceof User user)) {
            logger.warn("Principal is not a User instance: {}", principalObj.getClass().getName());
            return null;
        }

        // Re-validar el JWT guardado en credentials
        String jwt = (String) auth.getCredentials();

        if (jwt == null) {
            // Sin JWT en credentials, confiamos en el Principal existente (compatibilidad)
            logger.debug("No JWT in credentials for user {}, skipping re-validation", user.getId());
            return message;
        }

        try {
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Blacklisted token detected mid-session for user {}", user.getId());
                notifyTokenExpired(user.getUsername());
                return null;
            }

            if (!jwtService.isTokenValid(jwt, user)) {
                logger.warn("Token invalidated mid-session for user {}", user.getId());
                notifyTokenExpired(user.getUsername());
                return null;
            }

            return message;

        } catch (ExpiredJwtException e) {
            logger.warn("Token expired mid-session for user {}", user.getId());
            notifyTokenExpired(user.getUsername());
            return null;

        } catch (Exception e) {
            logger.warn("Token re-validation failed for user {}: {}", user.getId(), e.getMessage());
            notifyTokenExpired(user.getUsername());
            return null;
        }
    }

    // ==================== Helpers ====================

    private void notifyTokenExpired(String username) {
        try {
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/errors",
                    Map.of(
                            "code", "TOKEN_EXPIRED",
                            "message", "Your session has expired, please refresh your token and reconnect",
                            "timestamp", System.currentTimeMillis()
                    )
            );
        } catch (Exception e) {
            logger.debug("Could not notify token expiry to {}: {}", username, e.getMessage());
        }
    }
}