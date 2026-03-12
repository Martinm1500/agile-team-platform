package dev.martinm.platform.workspaces.notes.repository;

import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.notes.NotesWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotesWorkspaceRepository extends JpaRepository<NotesWorkspace, Long> {
    Optional<NotesWorkspace> findByProjectId(Long projectId);

    @Query("""
        SELECT DISTINCT nw
        FROM NotesWorkspace nw
        LEFT JOIN ProjectMember pm ON pm.project = nw.project
        WHERE nw.creator = :user
           OR pm.user = :user
        """)
    List<NotesWorkspace> findAllByUserIsCreatorOrProjectMember(@Param("user") User user);
}
