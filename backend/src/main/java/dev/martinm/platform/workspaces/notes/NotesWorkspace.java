package dev.martinm.platform.workspaces.notes;

import dev.martinm.platform.projects.Project;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "notes_workspaces")
@Data
public class NotesWorkspace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "project_id", unique = true)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    private String name;

    @OneToMany(mappedBy = "notesWorkspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Note> notes;

    public NotesWorkspace(User creator, String name){
        this.creator = creator;
        this.name = name;
    }

    public NotesWorkspace(Project project){
        this.project = project;
        this.creator = project.getCreator();
        this.name = project.getName();
    }

    public NotesWorkspace(){}

    public boolean isCreator(User user){
        return creator.getId().equals(user.getId());
    }
}
