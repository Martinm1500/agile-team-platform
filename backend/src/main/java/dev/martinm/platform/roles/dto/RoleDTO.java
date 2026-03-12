package dev.martinm.platform.roles.dto;

import dev.martinm.platform.roles.Role;
import lombok.Data;

@Data
public class RoleDTO {
    private Long id;
    private Long serverId;
    private String name;
    private String description;

    private boolean manageChannels;
    private boolean manageMembers;
    private boolean manageRoles;
    private boolean sendMessages;
    private boolean manageServers;
    private boolean manageProjects;

    public RoleDTO(Role role) {
        this.id = role.getId();
        this.serverId = role.getServer().getId();
        this.name = role.getName();

        this.manageChannels = role.isManageChannels();
        this.manageMembers = role.isManageMembers();
        this.manageRoles = role.isManageRoles();
        this.sendMessages = role.isSendMessages();
        this.manageServers = role.isManageServers();
        this.manageProjects = role.isManageProject();
    }
}