package dev.martinm.platform.auth;

import dev.martinm.platform.auth.repository.TokenBlacklistRepository;
import dev.martinm.platform.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Optional;

@Service
@Slf4j
public class TokenBlacklistService {

    private final TokenBlacklistRepository blacklistRepository;
    private final JwtService jwtService;

    public TokenBlacklistService(TokenBlacklistRepository blacklistRepository, @Lazy JwtService jwtService) {
        this.blacklistRepository = blacklistRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public void blacklistToken(String token) {
        try {
            // VERIFICAR SI YA ESTÁ BLACKLISTEADO
            if (blacklistRepository.findByToken(token).isPresent()) {
                log.debug("Token already blacklisted");
                return;
            }

            // EXTRAER LA EXPIRACIÓN REAL DEL TOKEN
            Date expiryDate = jwtService.extractExpiration(token);

            // VERIFICAR QUE EL TOKEN NO ESTÉ YA EXPIRADO
            if (expiryDate.before(new Date())) {
                log.debug("Token already expired, skipping blacklist");
                return;
            }

            TokenBlacklist blacklistedToken = new TokenBlacklist();
            blacklistedToken.setToken(token);
            blacklistedToken.setExpiryDate(new Timestamp(expiryDate.getTime()));

            blacklistRepository.save(blacklistedToken);
            log.debug("Token blacklisted until: {}", expiryDate);

        } catch (Exception e) {
            log.error("Error blacklisting token: {}", e.getMessage());
            throw new RuntimeException("Could not blacklist token", e);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        Optional<TokenBlacklist> blacklistedToken = blacklistRepository.findByToken(token);

        if (blacklistedToken.isPresent()) {
            // VERIFICAR SI EL TOKEN EN BLACKLIST SIGUE VIGENTE
            boolean isStillBlacklisted = blacklistedToken.get().getExpiryDate()
                    .after(new Timestamp(System.currentTimeMillis()));

            if (!isStillBlacklisted) {
                // LIMPIAR AUTOMÁTICAMENTE SI YA EXPIRÓ
                blacklistRepository.delete(blacklistedToken.get());
                return false;
            }
            return true;
        }
        return false;
    }

    @Scheduled(cron = "0 0 2 * * ?") // Diario a las 2 AM
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = blacklistRepository.deleteExpiredTokens();
        log.info("Cleaned up {} expired blacklisted tokens", deleted);
    }
}