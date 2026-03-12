package dev.martinm.platform.projects.dto;

import dev.martinm.platform.projects.Specialty;
import lombok.Data;

@Data
public class SpecialtyDTO {
    private Long id;
    private Long projectId;
    private String name;
    private String description;

    private boolean createTask;
    private boolean editTask;
    private boolean deleteTask;
    private boolean moveTask;
    private boolean assignTask;
    private boolean manageColumns;

    private boolean createNote;
    private boolean editNote;
    private boolean deleteNote;
    private boolean moveNote;
    private boolean lockNote;
    private boolean manageCategories;

    public SpecialtyDTO(){}

    public SpecialtyDTO(Specialty specialty) {
        if (specialty == null) return;

        this.id = specialty.getId();
        this.projectId = specialty.getProject() != null ? specialty.getProject().getId() : null;
        this.name = specialty.getName();
        this.description = specialty.getDescription();

        if (specialty.getKanbanPermission() != null) {
            this.createTask = specialty.getKanbanPermission().isCreateTask();
            this.editTask = specialty.getKanbanPermission().isEditTask();
            this.deleteTask = specialty.getKanbanPermission().isDeleteTask();
            this.moveTask = specialty.getKanbanPermission().isMoveTask();
            this.assignTask = specialty.getKanbanPermission().isAssignTask();
            this.manageColumns = specialty.getKanbanPermission().isManageColumns();
        }

        if (specialty.getNotesPermission() != null) {
            this.createNote = specialty.getNotesPermission().isCreateNote();
            this.editNote = specialty.getNotesPermission().isEditNote();
            this.deleteNote = specialty.getNotesPermission().isDeleteNote();
            this.moveNote = specialty.getNotesPermission().isMoveNote();
            this.manageCategories = specialty.getNotesPermission().isManageCategories();
        }
    }
}
