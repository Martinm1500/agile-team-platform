package dev.martinm.platform.projects;

import dev.martinm.platform.servers.InvitationStatus;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "project_invitations")
@Data
public class ProjectInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @CreationTimestamp
    private Timestamp createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    public boolean isPending() {
        return this.status == InvitationStatus.PENDING;
    }

    public boolean isAccepted() {
        return this.status == InvitationStatus.ACCEPTED;
    }

    public boolean isRejected() {
        return this.status == InvitationStatus.REJECTED;
    }

    public void accept() {
        this.status = InvitationStatus.ACCEPTED;
    }

    public void reject() {
        this.status = InvitationStatus.REJECTED;
    }

    public void reset() {
        this.status = InvitationStatus.PENDING;
    }

}
