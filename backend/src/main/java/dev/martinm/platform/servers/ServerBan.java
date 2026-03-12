package dev.martinm.platform.servers;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "server_bans")
@Data
public class ServerBan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "server_id")
    private Long serverId;

    @Column(name = "user_id")
    private Long userId;

    @CreationTimestamp
    private Timestamp bannedAt;

    private String reason;
}