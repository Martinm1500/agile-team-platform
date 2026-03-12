package dev.martinm.platform.servers.repository;

import dev.martinm.platform.servers.ServerInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServerInvitationRepository extends JpaRepository<ServerInvitation, Long> {
    Optional<ServerInvitation> findByServerIdAndInvitedUserId(Long serverId, Long invitedUserId);
}