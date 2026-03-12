package dev.martinm.platform.workspaces.notes;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "notes")
@Data
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "notes_workspace_id")
    private NotesWorkspace notesWorkspace;

    private String title;
    private String content;
    private String summary;
    private String topics;
    private String sources;
    private String insights;
    private Type type;
    private Integer position;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    public Note(NotesWorkspace notesWorkspace, String title, String content, String summary, String topics,
                String sources, String insights, Type type, int position, User creator) {
        this.notesWorkspace = notesWorkspace;
        this.title = title;
        this.content = content;
        this.summary = summary;
        this.topics = topics;
        this.sources = sources;
        this.insights = insights;
        this.type = type;
        this.position = position;
        this.creator = creator;
    }

    public Note(){}
}
