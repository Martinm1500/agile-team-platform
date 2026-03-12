package dev.martinm.platform.auth;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token = UUID.randomUUID().toString();

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Timestamp expiryDate;

    @Column(nullable = false)
    private boolean used = false;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}