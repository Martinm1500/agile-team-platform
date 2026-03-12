package dev.martinm.platform.audit;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action;

    private String entityType;

    private Long entityId;

    /*
    @Column(columnDefinition = "JSONB")
    private String details;  // Usa Map<String, Object> o JsonNode si necesitas parsing*/

    private Timestamp timestamp = new Timestamp(System.currentTimeMillis());
}
