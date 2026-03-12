package dev.martinm.platform.projects.repository;

import dev.martinm.platform.projects.Project;
import dev.martinm.platform.projects.ProjectMember;
import dev.martinm.platform.projects.ProjectMemberKey;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberKey> {

    @Query("SELECT m FROM ProjectMember m WHERE m.id.projectId = :projectId")
    List<ProjectMember> findByProjectId(Long projectId);

    @Query("""
    SELECT pm.project 
    FROM ProjectMember pm
    WHERE pm.user.id = :userId
      AND pm.project.server.id = :serverId
    """)
    List<Project> findProjectsByUserIdAndServerId(Long userId, Long serverId);


    @Modifying
    @Transactional
    @Query("""
        DELETE FROM ProjectMember pm
        WHERE pm.user.id = :userId
          AND pm.project.server.id = :serverId
    """)
    void deleteByUserIdAndServerId(Long userId, Long serverId);

}
