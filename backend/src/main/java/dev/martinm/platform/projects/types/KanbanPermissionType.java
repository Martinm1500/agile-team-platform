package dev.martinm.platform.projects.types;

public enum KanbanPermissionType {
    CREATE_TASK("createTask"),
    EDIT_TASK("editTask"),
    DELETE_TASK("deleteTask"),
    MOVE_TASK("moveTask"),
    ASSIGN_TASK("assignTask"),
    MANAGE_COLUMNS("manageColumns");

    KanbanPermissionType(String code) {
    }
}
