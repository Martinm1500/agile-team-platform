package dev.martinm.platform.workspaces.notes;

import dev.martinm.platform.projects.Specialty;
import dev.martinm.platform.projects.types.NotesPermissionType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "notes_permissions")
@Data
public class NotesPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    private boolean createNote;

    private boolean editNote;

    private boolean deleteNote;

    private boolean moveNote;

    private boolean manageCategories;

    public boolean hasPermission(NotesPermissionType type){
        return switch (type) {
            case CREATE_NOTE -> createNote;
            case EDIT_NOTE -> editNote;
            case DELETE_NOTE -> deleteNote;
            case MOVE_NOTE -> moveNote;
            case MANAGE_CATEGORIES -> manageCategories;
        };
    }

    public NotesPermission(Specialty specialty, boolean createNote, boolean editNote,
                           boolean deleteNote, boolean moveNote, boolean manageCategories) {
        this.specialty = specialty;
        this.createNote = createNote;
        this.editNote = editNote;
        this.deleteNote = deleteNote;
        this.moveNote = moveNote;
        this.manageCategories = manageCategories;
    }

    public NotesPermission(){}
}