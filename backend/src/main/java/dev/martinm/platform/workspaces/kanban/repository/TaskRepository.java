package dev.martinm.platform.workspaces.kanban.repository;

import dev.martinm.platform.workspaces.kanban.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByKanbanId(Long kanbanId);
}
