package dev.martinm.platform.contacts;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class ContactDTO {
    private Long id;
    private UserDTO requester;
    private UserDTO target;
    private Timestamp requestedAt;
    private Timestamp acceptedAt;
    private String status;

    public ContactDTO(Contact contact){
        this.id = contact.getId();
        this.requester = new UserDTO(contact.getRequester());
        this.target = new UserDTO(contact.getTarget());
        this.requestedAt = contact.getRequestedAt();
        this.acceptedAt = contact.getAcceptedAt();
        this.status = contact.getStatus().name();
    }
}
