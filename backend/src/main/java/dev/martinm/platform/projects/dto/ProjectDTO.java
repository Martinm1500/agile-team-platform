package dev.martinm.platform.projects.dto;

import dev.martinm.platform.projects.Project;
import lombok.Data;

@Data
public class ProjectDTO {
    private Long id;
    private Long serverId;
    private String name;
    private Long creatorId;
    private boolean hasKanban;
    private boolean hasNotes;

    public ProjectDTO(Long serverId, String name) {
        this.serverId = serverId;
        this.name = name;
    }

    public ProjectDTO(Project p){
        this.id= p.getId();
        this.serverId = p.getServer().getId();
        this.name = p.getName();
        this.creatorId = p.getCreator().getId();
        this.hasKanban = p.isHasKanban();
        this.hasNotes = p.isHasNotes();
    }

    public ProjectDTO(Long serverId, String name, boolean hasKanban, boolean hasNotes) {
        this.serverId = serverId;
        this.name = name;
        this.hasKanban = hasKanban;
        this.hasNotes = hasNotes;
    }

    public ProjectDTO(){}
}
