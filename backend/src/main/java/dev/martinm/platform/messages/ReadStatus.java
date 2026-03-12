package dev.martinm.platform.messages;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "read_status")
public class ReadStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;
}