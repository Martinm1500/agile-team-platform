package dev.martinm.platform.servers;

import dev.martinm.platform.roles.Role;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "server_members")
@Data
public class ServerMember {
    @EmbeddedId
    private ServerMemberKey id;

    @ManyToOne
    @MapsId("serverId")
    @JoinColumn(name = "server_id")
    private Server server;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private boolean active = true;

    @CreationTimestamp
    private Timestamp joinDate;

    public ServerMember(){}

    public ServerMember(ServerMemberKey id, Server server, User user, Role role) {
        this.id = id;
        this.server = server;
        this.user = user;
        this.role = role;
    }
}