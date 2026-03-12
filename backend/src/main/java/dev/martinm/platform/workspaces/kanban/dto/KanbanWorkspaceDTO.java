package dev.martinm.platform.workspaces.kanban.dto;

import dev.martinm.platform.workspaces.kanban.KanbanWorkspace;
import lombok.Data;

import java.util.List;

@Data
public class KanbanWorkspaceDTO {
    private Long id;
    private Long projectId;
    private Long ownerId;
    private String name;
    private List<ColumnDTO> columns;

    public KanbanWorkspaceDTO(KanbanWorkspace kanbanWorkspace){
        this.id = kanbanWorkspace.getId();
        if(kanbanWorkspace.getProject() != null) this.projectId = kanbanWorkspace.getProject().getId();
        this.name = kanbanWorkspace.getName();
    }

    public KanbanWorkspaceDTO(KanbanWorkspace kanbanWorkspace, List<ColumnDTO> columns){
        this.id = kanbanWorkspace.getId();
        if(kanbanWorkspace.getProject() != null) this.projectId = kanbanWorkspace.getProject().getId();
        this.ownerId = kanbanWorkspace.getCreator().getId();
        this.name = kanbanWorkspace.getName();
        this.columns = columns;
    }

    public KanbanWorkspaceDTO(){}
}
