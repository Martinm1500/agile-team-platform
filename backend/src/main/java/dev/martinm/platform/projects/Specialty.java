package dev.martinm.platform.projects;

import dev.martinm.platform.workspaces.notes.NotesPermission;
import dev.martinm.platform.workspaces.kanban.KanbanPermission;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "specialties")
@Data
public class Specialty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToOne(mappedBy = "specialty", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private KanbanPermission kanbanPermission;

    @OneToOne(mappedBy = "specialty", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private NotesPermission notesPermission;

    private String name;

    private String description;

    public Specialty(Project project, String name, String description) {
        this.project = project;
        this.name = name;
        this.description = description;
    }

    public Specialty(){}
}