package dev.martinm.platform.workspaces.kanban.dto;

import dev.martinm.platform.workspaces.kanban.Task;
import dev.martinm.platform.workspaces.kanban.TaskStatus;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Data
public class TaskDTO {
    private Long id;
    private Long kanbanId;
    private String title;
    private String description;
    private TaskStatus status;
    private Long columnId;
    private Long assigneeId;
    private Long creatorUserId;

    public TaskDTO(Task task){
        this.id = task.getId();
        this.kanbanId = task.getKanban().getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.columnId = task.getColumn().getId();
        this.status = task.getColumn().getStatus();
        this.assigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        this.creatorUserId  = task.getCreator()  != null ? task.getCreator().getId() : null;
    }

    public TaskDTO(){}
}
