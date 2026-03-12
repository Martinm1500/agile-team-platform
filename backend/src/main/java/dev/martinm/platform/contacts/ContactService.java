package dev.martinm.platform.contacts;

import dev.martinm.platform.notifications.NotificationService;
import dev.martinm.platform.notifications.NotificationType;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.contacts.exceptions.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ContactService {
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserContextService userContextService;

    public Contact requestContact(Long targetUserId) {
        Long requesterId = userContextService.getAuthenticatedUser().getId();
        if (requesterId.equals(targetUserId)) {
            throw new InvalidContactOperationException("Cannot add self as contact");
        }

        // Buscar si ya existe alguna relación entre ambos usuarios
        Optional<Contact> optionalContact = contactRepository.findByUsers(requesterId, targetUserId);
        if (optionalContact.isPresent()) {
            Contact existingContact = optionalContact.get();
            switch (existingContact.getStatus()) {
                case PENDING -> throw new ContactAlreadyExistsException("Contact request already pending");
                case ACCEPTED -> throw new ContactAlreadyExistsException("Users are already contacts");
                case BLOCKED -> throw new InvalidContactOperationException("Contact is blocked");
                case UNBLOCKED, REJECTED -> {
                    boolean isOriginalRequester = existingContact.getRequester().getId().equals(requesterId);
                    if (!isOriginalRequester) {
                        User temp = existingContact.getRequester();
                        existingContact.setRequester(existingContact.getTarget());
                        existingContact.setTarget(temp);
                    }
                    existingContact.pending();
                    existingContact.setRequestedAt(new java.sql.Timestamp(System.currentTimeMillis()));

                    Contact savedContact = contactRepository.save(existingContact);

                    notificationService.sendContactInvitationNotification(savedContact);

                    return savedContact;
                }
                default -> throw new InvalidContactOperationException("Invalid contact state");
            }
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ContactNotFoundException("Requester not found"));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ContactNotFoundException("Target user not found"));


        Contact savedContact = contactRepository.save(new Contact(requester,target));

        notificationService.sendContactInvitationNotification(savedContact);

        return savedContact;
    }

    public Contact acceptContact(Long contactId) {
        Long targetUserId = userContextService.getAuthenticatedUser().getId();

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found"));

        if (!contact.isPending()) {
            throw new InvalidContactOperationException("Contact request is not pending");
        }

        if (!contact.getTarget().getId().equals(targetUserId)) {
            throw new UnauthorizedActionException("Only the recipient can accept this contact request");
        }

        contact.accept();

        notificationService.readInvitationNotification(targetUserId,contactId, "accepted");
        notificationService.informInvitationAccepted(contact.getRequester(),
                contact.getTarget().getUsername(),
                contact.getId(),null,null,
                NotificationType.CONTACT_INVITATION_ACCEPTED);

        return contactRepository.save(contact);
    }

    public Contact rejectContact(Long contactId) {
        Long authenticatedUserId = userContextService.getAuthenticatedUser().getId();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found"));

        if (!contact.isPending()) {
            throw new InvalidContactOperationException("Contact request is not pending");
        }

        if (!contact.getTarget().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("Only the recipient can reject this contact request");
        }

        contact.reject();

        notificationService.readInvitationNotification(authenticatedUserId, contactId, "rejected");

        return contactRepository.save(contact);
    }

    public void blockContact(Long contactId) {
        Long authenticatedUserId = userContextService.getAuthenticatedUser().getId();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found"));

        if (!contact.getRequester().getId().equals(authenticatedUserId) && !contact.getTarget().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("You are not part of this contact");
        }

        contact.block();
        contact.setBlockedBy(userContextService.getAuthenticatedUser()); // Setea quien bloqueó
        contactRepository.save(contact);
    }

    public void deleteContact(Long contactId) {
        Long authenticatedUserId = userContextService.getAuthenticatedUser().getId();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found"));

        if (!contact.getRequester().getId().equals(authenticatedUserId) && !contact.getTarget().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("You are not allowed to delete this contact");
        }

        notificationService.sendContactRemovedNotification(contact);

        contactRepository.delete(contact);
    }

    public Contact unblockContact(Long contactId) {
        Long authenticatedUserId = userContextService.getAuthenticatedUser().getId();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ContactNotFoundException("Contact not found"));

        if (!contact.getStatus().equals(ContactStatus.BLOCKED)) {
            throw new InvalidContactOperationException("Contact is not blocked");
        }

        if (contact.getBlockedBy() == null || !contact.getBlockedBy().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("You did not block this contact");
        }

        contact.unblock();

        return contactRepository.save(contact);
    }

    public List<ContactDTO> getAcceptedContacts() {
        Long userId = userContextService.getAuthenticatedUser().getId();
        List<Contact> contacts = contactRepository.findAcceptedByUserId(userId);
        List<ContactDTO> contactDTOS = new ArrayList<>();

        for(Contact contact : contacts ){
            contactDTOS.add(new ContactDTO(contact));
        }
        return contactDTOS;
    }

    public List<ContactDTO> getBlockedContacts() {
        Long userId = userContextService.getAuthenticatedUser().getId();
        List<Contact> contacts = contactRepository.findBlockedByUserId(userId);
        List<ContactDTO> contactDTOS = new ArrayList<>();

        for(Contact contact : contacts ){
            contactDTOS.add(new ContactDTO(contact));
        }

       return contactDTOS;
    }

    public List<ContactDTO> getIncomingPendingContacts() {
        Long userId = userContextService.getAuthenticatedUser().getId();

        List<Contact> contacts = contactRepository.findIncomingPendingByUserId(userId);
        List<ContactDTO> contactDTOS = new ArrayList<>();

        for(Contact contact : contacts ){
            contactDTOS.add(new ContactDTO(contact));
        }

        return contactDTOS;
    }

    public List<ContactDTO> getOutgoingPendingContacts() {
        Long userId = userContextService.getAuthenticatedUser().getId();

        List<Contact> contacts = contactRepository.findOutgoingPendingByUserId(userId);
        List<ContactDTO> contactDTOS = new ArrayList<>();

        for(Contact contact : contacts ){
            contactDTOS.add(new ContactDTO(contact));
        }

        return contactDTOS;
    }
}