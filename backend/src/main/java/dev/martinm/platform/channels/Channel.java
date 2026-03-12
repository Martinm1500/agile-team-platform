package dev.martinm.platform.channels;

import dev.martinm.platform.messages.Conversation;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.servers.Server;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "channels")
@Data
public class Channel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id")
    private Server server;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToOne(mappedBy = "channel", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Conversation conversation;


    private String name;

    @Enumerated(EnumType.STRING)
    private ChannelType type;

    public Channel(Server server, String name, ChannelType type) {
        this.server = server;
        this.name = name;
        this.type = type;
    }

    public Channel(Server server, Project project, String name, ChannelType type) {
        this.server = server;
        this.project = project;
        this.name = name;
        this.type = type;
    }

    public Channel(){}
}
