package dev.martinm.platform.projects.types;

public enum NotesPermissionType {
    CREATE_NOTE("createNote"),
    EDIT_NOTE("editNote"),
    DELETE_NOTE("deleteNote"),
    MOVE_NOTE("moveNote"),
    MANAGE_CATEGORIES("manageCategories");

    NotesPermissionType(String code) {
    }
}
