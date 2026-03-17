package dev.martinm.platform.messages;

import dev.martinm.platform.channels.Channel;
import dev.martinm.platform.contacts.Contact;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@Data
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationType type;

    @OneToOne
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @OneToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<ReadStatus> readStatuses = new ArrayList<>();

    public static Conversation forChannel(Channel channel) {
        Conversation c = new Conversation();
        c.type = ConversationType.CHANNEL;
        c.channel = channel;
        return c;
    }

    public static Conversation forDM(Contact contact) {
        Conversation c = new Conversation();
        c.type = ConversationType.DM;
        c.contact = contact;
        return c;
    }

    public Conversation() {}
}
