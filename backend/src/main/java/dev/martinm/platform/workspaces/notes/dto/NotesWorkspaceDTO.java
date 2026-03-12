package dev.martinm.platform.workspaces.notes.dto;

import dev.martinm.platform.workspaces.notes.NotesWorkspace;
import lombok.Data;

@Data
public class NotesWorkspaceDTO {
    private Long id;
    private Long projectId;
    private String name;

    public NotesWorkspaceDTO(NotesWorkspace notesWorkspace){
        this.id = notesWorkspace.getId();
        if(notesWorkspace.getProject()!= null){
            this.projectId = notesWorkspace.getProject().getId();
        }

        this.name = notesWorkspace.getName();
    }
}