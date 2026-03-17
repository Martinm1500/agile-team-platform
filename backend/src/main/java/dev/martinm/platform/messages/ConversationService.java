package dev.martinm.platform.messages;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.contacts.Contact;
import dev.martinm.platform.contacts.ContactRepository;
import dev.martinm.platform.users.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final UserContextService userContextService;
    private final ContactRepository contactRepository;

    @Transactional
    public Conversation getOrCreateConversationForDM(Long contactId) {
        User authenticatedUser = getAuthenticatedUser();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.isRequester(authenticatedUser) && !contact.isTarget(authenticatedUser)) {
            throw new IllegalStateException("You are not part of this contact");
        }
        if (!contact.isAccepted()) {
            throw new IllegalStateException("Contact must be ACCEPTED");
        }
        return conversationRepository.findByContactId(contactId)
                .orElseGet(() -> {
                    Conversation c = Conversation.forDM(contact);
                    return conversationRepository.save(c);
                });
    }

    public List<Conversation> getConversationForServerId(Long serverId){
        return conversationRepository.findAllByChannel_Server_Id(serverId);
    }

    public Conversation getConversationByChannelId(Long channelId){
        return conversationRepository.findByChannelId(channelId).orElseThrow(
                () -> new RuntimeException("Conversation not found")
        );
    }

    private User getAuthenticatedUser() {
        return userContextService.getAuthenticatedUser();
    }

}
