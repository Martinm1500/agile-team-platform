package dev.martinm.platform.projects;

import dev.martinm.platform.channels.Channel;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.kanban.KanbanWorkspace;
import dev.martinm.platform.workspaces.notes.NotesWorkspace;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    private String name;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Channel> channels = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Specialty> specialties = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<ProjectMember> projectMembers = new ArrayList<>();

    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private KanbanWorkspace kanbanWorkspace;

    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private NotesWorkspace notesWorkspace;

    private boolean hasKanban;
    private boolean hasNotes;

    public Project(Server server, String name, User creator) {
        this.server = server;
        this.name = name;
        this.creator = creator;
    }

    public Project(Server server, String name, User creator, boolean hasKanban, boolean hasNotes){
        this.server = server;
        this.name = name;
        this.creator = creator;
        this.hasKanban = hasKanban;
        this.hasNotes = hasNotes;
    }

    public Project(){}
}