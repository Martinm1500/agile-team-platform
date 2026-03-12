package dev.martinm.platform.servers.repository;

import dev.martinm.platform.servers.ServerBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerBanRepository extends JpaRepository<ServerBan, Long> {
    Optional<ServerBan> findByServerIdAndUserId(Long serverId, Long userId);
    List<ServerBan> findByServerId(Long serverId);
}