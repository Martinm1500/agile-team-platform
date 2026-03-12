package dev.martinm.platform.workspaces.notes.dto;

import dev.martinm.platform.workspaces.notes.Note;
import dev.martinm.platform.workspaces.notes.Type;
import lombok.Data;

@Data
public class NoteDTO {
    private Long id;
    private Long workspaceId;
    private String title;
    private String content;
    private String summary;
    private String topics;
    private String sources;
    private String insights;
    private Type type;
    private Integer position;
    private Long creatorUserId;

    public NoteDTO(Note note) {
        this.id = note.getId();
        this.workspaceId = note.getNotesWorkspace().getId();
        this.title = note.getTitle();
        this.content = note.getContent();
        this.summary = note.getSummary();
        this.topics = note.getTopics();
        this.sources = note.getSources();
        this.insights = note.getInsights();
        this.type = note.getType();
        this.position = note.getPosition();
        this.creatorUserId = note.getCreator() != null ? note.getCreator().getId() : null;
    }
}
