package dev.martinm.platform.notifications;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "notification_type", discriminatorType = DiscriminatorType.STRING)
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column
    private Long relatedId; //Puede ser el id de una invitacion a un servidor, a un proyecto, o el id de un contacto

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    private Long relatedServerId;
    private Long relatedProjectId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String status;

    public Notification() {}

    public Notification(User user, String title, String message,Long relatedId, NotificationType type){
        this.user = user;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.type = type;
    }

    public Notification(User user, String title, String message, Long relatedId, NotificationType type, Long relatedServerId, Long relatedProjectId ) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.type = type;
        this.relatedServerId = relatedServerId;
        this.relatedProjectId = relatedProjectId;
    }

    public Notification(User user, String title, String message, Long relatedId, NotificationType type, Long relatedServerId ) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.type = type;
        this.relatedServerId = relatedServerId;
    }

    public void read(){
        this.isRead = true;
    }
}