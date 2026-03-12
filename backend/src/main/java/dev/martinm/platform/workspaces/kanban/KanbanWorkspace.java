package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.projects.Project;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "kanban_workspaces")
@Data
public class KanbanWorkspace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "project_id", unique = true)
    private Project project;

    private String name;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "kanban", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Column> columns;


    public KanbanWorkspace(String name, User creator){
        this.name = name;
        this.creator = creator;
    }

    public KanbanWorkspace(Project project){
        this.project = project;
        this.name = project.getName();
        this.creator = project.getCreator();
    }

    public KanbanWorkspace(){}

    public boolean isCreator(User user){
        return creator.getId().equals(user.getId());
    }
}
