package dev.martinm.platform.roles.dto;

import lombok.Data;

@Data
public class RoleRequestDTO {
    private Long serverId;
    private String name;
    private String description;

    private boolean manageChannels;
    private boolean manageMembers;
    private boolean manageRoles;
    private boolean sendMessages;
    private boolean manageServers;
}
