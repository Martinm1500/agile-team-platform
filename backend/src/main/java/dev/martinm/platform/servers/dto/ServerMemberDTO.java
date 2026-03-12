package dev.martinm.platform.servers.dto;

import dev.martinm.platform.servers.ServerMember;
import dev.martinm.platform.users.Status;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class ServerMemberDTO {
    private Long serverId;
    private Long userId;
    private Long roleId;
    private String username;
    private String avatarUrl;
    private Status status;
    private Timestamp joinDate;

    public ServerMemberDTO(){}

    public ServerMemberDTO(ServerMember m) {
        this.serverId = m.getServer().getId();
        this.userId = m.getUser().getId();
        this.roleId = m.getRole().getId();
        this.username = m.getUser().getUsername();
        this.avatarUrl = m.getUser().getAvatarUrl();
        this.status = m.getUser().getStatus();
        this.joinDate = m.getJoinDate();
    }
}