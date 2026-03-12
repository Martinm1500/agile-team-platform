package dev.martinm.platform.workspaces.kanban.dto;

import dev.martinm.platform.workspaces.kanban.Column;
import dev.martinm.platform.workspaces.kanban.TaskStatus;
import lombok.Data;

@Data
public class ColumnDTO {
    private Long id;
    private Long kanbanId;
    private String name;
    private int orderPosition;
    private TaskStatus status;

    public ColumnDTO(Column column){
        this.id = column.getId();
        this.kanbanId = column.getKanban().getId();
        this.name = column.getName();
        this.status = column.getStatus();
    }
}