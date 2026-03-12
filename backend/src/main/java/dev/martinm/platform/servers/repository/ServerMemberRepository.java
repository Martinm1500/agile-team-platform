package dev.martinm.platform.servers.repository;

import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.ServerMember;
import dev.martinm.platform.servers.ServerMemberKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerMemberRepository extends JpaRepository<ServerMember, ServerMemberKey> {

    @Query("SELECT m FROM ServerMember m WHERE m.id.serverId = :serverId")
    List<ServerMember> findByServerId(Long serverId);

    @Query("SELECT sm.server FROM ServerMember sm WHERE sm.user.id = :userId")
    List<Server> findServersByUserId(Long userId);
}