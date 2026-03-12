// Contact.java
package dev.martinm.platform.contacts;

import dev.martinm.platform.messages.Conversation;
import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "contacts")
@Data
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne(optional = false)
    @JoinColumn(name = "target_id")
    private User target;

    @Enumerated(EnumType.STRING)
    private ContactStatus status = ContactStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "blocked_by_id")
    private User blockedBy;

    @CreationTimestamp
    private Timestamp requestedAt;

    private Timestamp acceptedAt;

    @OneToOne(mappedBy = "contact", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Conversation conversation;

    public Contact(User requester, User target) {
        this.requester = requester;
        this.target = target;
    }

    public Contact() {}

    public void accept() {
        this.status = ContactStatus.ACCEPTED;
        this.acceptedAt = new Timestamp(System.currentTimeMillis());
    }

    public void reject() {
        this.status = ContactStatus.REJECTED;
    }

    public void block() {
        this.status = ContactStatus.BLOCKED;
    }

    public void unblock() {
        this.status = ContactStatus.UNBLOCKED;
        this.blockedBy = null;
    }

    public void pending() {
        this.status = ContactStatus.PENDING;
    }

    public boolean isPending() {
        return status.equals(ContactStatus.PENDING);
    }

    public boolean isAccepted() {
        return status.equals(ContactStatus.ACCEPTED);
    }

    public boolean isRequester(User user) {
        return user.getId().equals(requester.getId());
    }

    public boolean isTarget(User user) {
        return user.getId().equals(target.getId());
    }
}
