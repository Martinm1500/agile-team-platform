package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.projects.Specialty;
import dev.martinm.platform.projects.types.KanbanPermissionType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "kanban_permissions")
@Data
public class KanbanPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    private boolean createTask;

    private boolean editTask;

    private boolean deleteTask;

    private boolean moveTask;

    private boolean assignTask;

    private boolean manageColumns;

    public boolean hasPermission(KanbanPermissionType type){
        return switch (type) {
            case CREATE_TASK -> createTask;
            case EDIT_TASK -> editTask;
            case DELETE_TASK -> deleteTask;
            case MOVE_TASK -> moveTask;
            case ASSIGN_TASK -> assignTask;
            case MANAGE_COLUMNS -> manageColumns;
        };
    }

    public KanbanPermission(Specialty specialty, boolean createTask, boolean editTask, boolean deleteTask, boolean moveTask, boolean assignTask, boolean manageColumns) {
        this.specialty = specialty;
        this.createTask = createTask;
        this.editTask = editTask;
        this.deleteTask = deleteTask;
        this.moveTask = moveTask;
        this.assignTask = assignTask;
        this.manageColumns = manageColumns;
    }

    public KanbanPermission(){}
}