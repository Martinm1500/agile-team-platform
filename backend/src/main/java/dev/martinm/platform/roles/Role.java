package dev.martinm.platform.roles;

import dev.martinm.platform.servers.Server;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")
@Data
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    private String name;
    private String description;

    private boolean manageChannels;
    private boolean manageMembers;
    private boolean manageRoles;
    private boolean sendMessages;
    private boolean manageServers;
    private boolean manageProject;

    public boolean hasPermission(PermissionType type) {
        return switch (type) {
            case MANAGE_CHANNELS -> manageChannels;
            case MANAGE_MEMBERS -> manageMembers;
            case MANAGE_ROLES -> manageRoles;
            case SEND_MESSAGES -> sendMessages;
            case MANAGE_SERVERS -> manageServers;
            case MANAGE_PROJECTS -> manageProject;
        };
    }

    public Role(){}
}
