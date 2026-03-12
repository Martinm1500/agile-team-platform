package dev.martinm.platform.auth.repository;

import dev.martinm.platform.auth.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    Optional<TokenBlacklist> findByToken(String token);

    @Modifying
    @Query("DELETE FROM TokenBlacklist t WHERE t.expiryDate < CURRENT_TIMESTAMP")
    int deleteExpiredTokens(); // Retornar cantidad eliminada

    // Buscar tokens que aún están vigentes en la blacklist
    @Query("SELECT t FROM TokenBlacklist t WHERE t.token = :token AND t.expiryDate > CURRENT_TIMESTAMP")
    Optional<TokenBlacklist> findActiveBlacklistedToken(@Param("token") String token);
}