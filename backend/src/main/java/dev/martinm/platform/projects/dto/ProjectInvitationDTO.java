package dev.martinm.platform.projects.dto;

import dev.martinm.platform.projects.ProjectInvitation;
import dev.martinm.platform.servers.InvitationStatus;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class ProjectInvitationDTO {

    private Long id;
    private Long serverId;
    private Long projectId;
    private Long invitedUserId;
    private Long senderUserId;
    private InvitationStatus status;
    private Timestamp createdAt;

    public ProjectInvitationDTO(ProjectInvitation projectInvitation){
        this.id = projectInvitation.getId();
        this.serverId = projectInvitation.getServer().getId();
        this.projectId = projectInvitation.getProject().getId();
        this.invitedUserId = projectInvitation.getInvitedUser().getId();
        this.senderUserId = projectInvitation.getCreatedBy().getId();
        this.status = projectInvitation.getStatus();
        this.createdAt = projectInvitation.getCreatedAt();
    }
}
