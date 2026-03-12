package dev.martinm.platform.servers;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "request_to_join")
@Data
public class RequestToJoin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @ManyToOne
    @JoinColumn(name = "requester_user_id", nullable = false)
    private User requester;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @CreationTimestamp
    private Timestamp createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    public RequestToJoin(Server server, User requester) {
        this.server = server;
        this.requester = requester;
        this.createdBy = requester;
    }

    public RequestToJoin(){}

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
