package dev.martinm.platform.workspaces.kanban.dto;

import lombok.Data;

@Data
public class TaskUpdateMessage {
    private String action; // "CREATE", "UPDATE", "DELETE"
    private TaskDTO task;
    private Long id; // Solo para DELETE
    private Long senderId;

    // Constructor para CREATE y UPDATE
    public TaskUpdateMessage(String action, TaskDTO task, Long senderId) {
        this.action = action;
        this.task = task;
        this.senderId = senderId;
    }

    // Constructor para DELETE
    public TaskUpdateMessage(String action, Long id, Long senderId) {
        this.action = action;
        this.id = id;
        this.senderId = senderId;
    }
}