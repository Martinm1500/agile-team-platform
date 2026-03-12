package dev.martinm.platform.roles;

import lombok.Getter;

@Getter
public enum PermissionType {

    MANAGE_CHANNELS("manageChannels"),
    MANAGE_MEMBERS("manageMembers"),
    MANAGE_ROLES("manageRoles"),
    SEND_MESSAGES("sendMessages"),
    MANAGE_SERVERS("manageServers"),
    MANAGE_PROJECTS("manageProject");

    private final String code;

    PermissionType(String code) {
        this.code = code;
    }

}
