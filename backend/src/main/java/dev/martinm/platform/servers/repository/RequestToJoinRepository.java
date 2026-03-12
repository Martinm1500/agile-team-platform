package dev.martinm.platform.servers.repository;

import dev.martinm.platform.servers.InvitationStatus;
import dev.martinm.platform.servers.RequestToJoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestToJoinRepository extends JpaRepository<RequestToJoin, Long> {
    @Query("""
    SELECT r
    FROM RequestToJoin r
    WHERE r.requester.id = :requesterId
""")
    List<RequestToJoin> findAllByRequesterId(Long requesterId);

    @Query("""
    SELECT r
    FROM RequestToJoin r
    WHERE r.server.id = :serverId
      AND r.requester.id = :requesterId
""")
    Optional<RequestToJoin> findByServerIdAndRequesterId(Long serverId, Long requesterId);
}
