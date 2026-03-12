package dev.martinm.platform.roles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    @Query("SELECT r FROM Role r WHERE r.server.id = :serverId")
    List<Role> findByServerId(@Param("serverId") Long serverId);

    @Query("SELECT r FROM Role r WHERE r.server.id = :serverId AND r.name = :name")
    Optional<Role> findByServerIdAndName(@Param("serverId") Long serverId, @Param("name") String name);
}
