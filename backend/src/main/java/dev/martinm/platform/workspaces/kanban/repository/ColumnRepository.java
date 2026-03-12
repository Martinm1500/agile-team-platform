package dev.martinm.platform.workspaces.kanban.repository;


import dev.martinm.platform.workspaces.kanban.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<Column, Long> {

    List<Column> findByKanbanIdOrderByOrderPosition(Long kanbanId);
}
