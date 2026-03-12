package dev.martinm.platform.servers.dto;

import lombok.Data;

@Data
public class ServerInvitationRequest {
    private Long userId;

    public ServerInvitationRequest(){}
}
