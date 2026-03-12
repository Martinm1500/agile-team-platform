package dev.martinm.platform.servers;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "server_invitations")
@Data
public class ServerInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

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

    public ServerInvitation(Server server, User invitedUser, User createdBy) {
        this.server = server;
        this.invitedUser = invitedUser;
        this.createdBy = createdBy;
    }

    public ServerInvitation(){}

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
}
