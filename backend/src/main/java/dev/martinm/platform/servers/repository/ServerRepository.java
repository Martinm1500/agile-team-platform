package dev.martinm.platform.servers.repository;


import dev.martinm.platform.servers.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {

    @Query("SELECT s FROM Server s WHERE s.privacy != 'PRIVATE'")
    List<Server> findAllNonPrivateServers();

    @Query("SELECT COUNT(m) FROM Server s JOIN s.members m WHERE s.id = :serverId")
    Long countMembersByServerId(Long serverId);
}