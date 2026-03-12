package dev.martinm.platform.security;

import dev.martinm.platform.auth.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService, TokenBlacklistService tokenBlacklistService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Verificar si hay token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // 2. ✅ VERIFICAR BLACKLIST PRIMERO (NUEVO)
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Blacklisted token attempted use");
                sendUnauthorizedError(response, "Token revoked");
                return;
            }

            // 3. Extraer username del token
            final String username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 4. Cargar usuario desde BD
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Validar token completo (firma, expiración, etc.)
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 6. Crear y establecer autenticación
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authenticated user: {}", username);

                } else {
                    logger.warn("Invalid JWT token for user: {}", username);
                }
            }

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("Expired JWT token: {}", e.getMessage());
            sendUnauthorizedError(response, "Token expired");
            return;

        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token: {}", e.getMessage());
            sendUnauthorizedError(response, "Invalid token");
            return;

        } catch (UsernameNotFoundException e) {
            logger.warn("User not found for JWT token: {}", e.getMessage());
            sendUnauthorizedError(response, "User not found");
            return;

        } catch (Exception e) {
            logger.error("Unexpected error during JWT authentication: {}", e.getMessage());
            sendUnauthorizedError(response, "Authentication error");
            return;
        }

        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }

    /**
     * ✅ NUEVO: Enviar respuesta de error 401
     */
    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", message)
        );
    }

    /**
     * ✅ OPCIONAL: Excluir endpoints públicos del filtro
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/auth/forgot-password") ||
                path.startsWith("/api/auth/reset-password");
    }
}