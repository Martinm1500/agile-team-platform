package dev.martinm.platform.workspaces.kanban.repository;

import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.kanban.KanbanWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanWorkspaceRepository extends JpaRepository<KanbanWorkspace, Long> {
     Optional<KanbanWorkspace> findByProjectId(Long projectId);

     @Query("SELECT kw FROM KanbanWorkspace kw WHERE kw.creator = :user OR EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.project = kw.project AND pm.user = :user)")
     List<KanbanWorkspace> findAllByUser(User user);
}
