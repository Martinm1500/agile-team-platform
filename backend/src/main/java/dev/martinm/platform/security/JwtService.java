package dev.martinm.platform.security;

import dev.martinm.platform.auth.dto.TokenPair;
import dev.martinm.platform.auth.TokenBlacklistService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    private static final int MIN_KEY_BYTES = 32;
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secretKey:${JWT_SECRET_KEY}}")
    private String secretKey;

    @Value("${jwt.accessTokenExpiration:900000}")  // 15 min
    private long ACCESS_TOKEN_EXPIRATION;

    @Value("${jwt.refreshTokenExpiration:604800000}")  // 7 days
    private long REFRESH_TOKEN_EXPIRATION;

    private final TokenBlacklistService tokenBlacklistService;

    public JwtService(TokenBlacklistService tokenBlacklistService) {
        this.tokenBlacklistService = tokenBlacklistService;
    }

    public TokenPair generateTokenPair(String username) {
        return new TokenPair(generateAccessToken(username), generateRefreshToken(username));
    }

    public String generateAccessToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        return generateToken(claims, username, ACCESS_TOKEN_EXPIRATION);
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return generateToken(claims, username, REFRESH_TOKEN_EXPIRATION);
    }

    private String generateToken(Map<String, Object> claims, String username, long expirationTime) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + expirationTime);

            return Jwts.builder()
                    .claims(claims)
                    .subject(username)
                    .issuedAt(now)
                    .expiration(expiryDate)
                    .issuer("your-app")
                    .audience().add("api-clients").and()
                    .signWith(getSignKey())
                    .compact();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error generating JWT token: {}", e.getMessage());
            throw new JwtException("Failed to generate JWT token.", e);
        }
    }

    private SecretKey getSignKey() {
        if (secretKey == null) {
            throw new MissingSecretKeyException("The JWT_SECRET_KEY environment variable must be set.");
        }
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        if (keyBytes.length < MIN_KEY_BYTES) {
            log.error("The decoded secret key must be at least {} bytes long.", MIN_KEY_BYTES);
            throw new MissingSecretKeyException("The decoded secret key is too short.");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                return false;
            }
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String refreshAccessToken(String refreshToken) {
        try {
            Claims claims = extractAllClaims(refreshToken);
            if (!"refresh".equals(claims.get("type"))) {
                throw new JwtException("Not a refresh token");
            }
            if (isTokenExpired(refreshToken)) {
                throw new JwtException("Refresh token has expired");
            }
            String username = extractUsername(refreshToken);
            return generateAccessToken(username);
        } catch (ExpiredJwtException e) {
            throw new JwtException("Refresh token has expired");
        } catch (JwtException e) {
            throw new JwtException("Invalid refresh token");
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
}