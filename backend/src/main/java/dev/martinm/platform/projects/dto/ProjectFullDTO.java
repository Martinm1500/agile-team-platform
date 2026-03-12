package dev.martinm.platform.projects.dto;

import dev.martinm.platform.channels.ChannelDTO;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.kanban.dto.KanbanWorkspaceDTO;
import dev.martinm.platform.workspaces.notes.dto.NotesWorkspaceDTO;
import lombok.Data;

import java.util.List;

@Data
public class ProjectFullDTO {
    private Long id;
    private Long serverId;
    private String name;

    private ProjectCreatorDTO projectCreator;
    private List<ProjectMemberDTO> projectMembers;
    private List<ChannelDTO> channels;
    private List<SpecialtyDTO> specialties;
    private KanbanWorkspaceDTO kanbanWorkspace;
    private NotesWorkspaceDTO notesWorkspace;

    public ProjectFullDTO(Project project, User user, List<ProjectMemberDTO> projectMemberDTOS,
                                               List<SpecialtyDTO> specialtyDTOS, List<ChannelDTO> channelDTOS,
                                               KanbanWorkspaceDTO kanbanWorkspaceDTO, NotesWorkspaceDTO notesWorkspaceDTO) {
        this.id = project.getId();
        this.serverId = project.getServer().getId();
        this.name = project.getName();

        this.projectCreator = new ProjectCreatorDTO(project.getId(),user);
        this.projectMembers = projectMemberDTOS;
        this.channels = channelDTOS;
        this.specialties = specialtyDTOS;
        this.kanbanWorkspace = kanbanWorkspaceDTO;
        this.notesWorkspace = notesWorkspaceDTO;
    }
}
