package dev.martinm.platform.servers.dto;

import dev.martinm.platform.servers.InvitationStatus;
import dev.martinm.platform.servers.RequestToJoin;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class RequestToJoinDTO {
    private Long id;
    private Long serverId;
    private Long requesterId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status;

    public RequestToJoinDTO(RequestToJoin request){
        this.id = request.getId();
        this.serverId = request.getServer().getId();
        this.requesterId = request.getRequester().getId();
        this.status = request.getStatus();
    }
}
