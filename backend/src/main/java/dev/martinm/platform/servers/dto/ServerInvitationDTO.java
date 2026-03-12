package dev.martinm.platform.servers.dto;

import dev.martinm.platform.servers.InvitationStatus;
import dev.martinm.platform.servers.ServerInvitation;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class ServerInvitationDTO {
    private Long id;
    private Long serverId;
    private Long invitedUserId;
    private Long senderUserId;
    private InvitationStatus status;
    private Timestamp createdAt;

    public ServerInvitationDTO(ServerInvitation serverInvitation){
        this.id = serverInvitation.getId();
        this.serverId = serverInvitation.getServer().getId();
        this.invitedUserId = serverInvitation.getInvitedUser().getId();
        this.senderUserId = serverInvitation.getCreatedBy().getId();
        this.status = serverInvitation.getStatus();
        this.createdAt = serverInvitation.getCreatedAt();
    }
}
