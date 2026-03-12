package dev.martinm.platform.contacts;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/{targetUserId}/request")
    public ResponseEntity<ContactDTO> requestContact(@PathVariable Long targetUserId) {
        return ResponseEntity.ok(new ContactDTO(contactService.requestContact(targetUserId)));
    }

    @PatchMapping("/{contactId}/accept")
    public ResponseEntity<ContactDTO> acceptContact(@PathVariable Long contactId) {
        return ResponseEntity.ok(new ContactDTO(contactService.acceptContact(contactId)));
    }

    @PatchMapping("/{contactId}/block")
    public ResponseEntity<Map<String, String>> blockContact(@PathVariable Long contactId) {
        contactService.blockContact(contactId);
        return ResponseEntity.ok(Map.of("message", "Contact blocked successfully"));
    }

    @PatchMapping("/{contactId}/unblock")
    public ResponseEntity<ContactDTO> unblockContact(@PathVariable Long contactId) {
        return ResponseEntity.ok(new ContactDTO(contactService.unblockContact(contactId)));
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<Map<String, String>> deleteContact(@PathVariable Long contactId) {
        contactService.deleteContact(contactId);
        return ResponseEntity.ok(Map.of("message", "Contact deleted successfully"));
    }

    @PatchMapping("/{contactId}/reject")
    public ResponseEntity<ContactDTO> rejectContact(@PathVariable Long contactId) {
        return ResponseEntity.ok(new ContactDTO(contactService.rejectContact(contactId)));
    }

    @GetMapping("/accepted")
    public ResponseEntity<List<ContactDTO>> getAcceptedContacts() {
        return ResponseEntity.ok(contactService.getAcceptedContacts());
    }

    @GetMapping("/blocked")
    public ResponseEntity<List<ContactDTO>> getBlockedContacts() {
        return ResponseEntity.ok(contactService.getBlockedContacts());
    }

    @GetMapping("/pending/incoming")
    public ResponseEntity<List<ContactDTO>> getIncomingPendingContacts() {
        return ResponseEntity.ok(contactService.getIncomingPendingContacts());
    }

    @GetMapping("/pending/outgoing")
    public ResponseEntity<List<ContactDTO>> getOutgoingPendingContacts() {
        return ResponseEntity.ok(contactService.getOutgoingPendingContacts());
    }
}