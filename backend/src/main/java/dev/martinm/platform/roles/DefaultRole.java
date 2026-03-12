package dev.martinm.platform.roles;

import lombok.Getter;

@Getter
public enum DefaultRole {
    ADMIN("Admin", "Administrator role with full permissions"),
    MEMBER("Member", "Standard member role"),
    GUEST("Guest", "Limited permissions, can view but not manage");

    private final String name;
    private final String description;

    DefaultRole(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
