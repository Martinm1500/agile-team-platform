package dev.martinm.platform.servers;

import dev.martinm.platform.channels.Channel;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.roles.Role;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servers")
@Data
public class Server {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    private String avatarUrl = "./cyberpunk.jpg";

    private String bannerUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23";

    private String description;

    @Enumerated(EnumType.STRING)
    private Privacy privacy = Privacy.DEFAULT;

    @CreationTimestamp
    private Timestamp createdAt;

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Role> roles = new ArrayList<>();

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServerMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Channel> channels = new ArrayList<>();

    public Server(String name, User owner) {
        this.name = name;
        this.owner = owner;
    }

    public boolean isPrivate(){
        return privacy == Privacy.PRIVATE;
    }

    public boolean isDefault(){
        return privacy == Privacy.DEFAULT;
    }

    public boolean isPublic(){
        return privacy == Privacy.PUBLIC;
    }

    public Server(){}
}