package dev.martinm.platform.messages;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.channels.Channel;
import dev.martinm.platform.channels.ChannelRepository;
import dev.martinm.platform.channels.ChannelType;
import dev.martinm.platform.contacts.Contact;
import dev.martinm.platform.contacts.ContactRepository;
import dev.martinm.platform.contacts.ContactStatus;
import dev.martinm.platform.contacts.UserDTO;
import dev.martinm.platform.messages.dto.ConversationStatusDTO;
import dev.martinm.platform.messages.dto.IncomingMessageNotificationDTO;
import dev.martinm.platform.messages.dto.MessageDTO;
import dev.martinm.platform.projects.ProjectPermissionService;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.users.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final ContactRepository contactRepository;
    private final ServerPermissionService serverPermissionService;
    private final ProjectPermissionService projectPermissionService;
    private final UserContextService userContextService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationRepository conversationRepository;
    private final ReadStatusRepository readStatusRepository;

    @Transactional
    public void sendToChannel(Long channelId, String content, User sender) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        if (channel.getType() != ChannelType.TEXT) {
            throw new IllegalStateException("Messages can only be sent to TEXT channels");
        }
        Long serverId = channel.getServer().getId();
        serverPermissionService.checkServerPermission(serverId, PermissionType.SEND_MESSAGES, sender);
        if (channel.getProject() != null) {
            projectPermissionService.checkIsProjectMember(channel.getProject().getId(), sender.getId());
        }
        Conversation conversation = conversationRepository
                .findByChannelId(channelId)
                .orElseGet(() -> {
                    Conversation c = Conversation.forChannel(channel);
                    return conversationRepository.save(c);
                });
        Message savedMessage = messageRepository.save(
                new Message(sender, content, conversation)
        );
        MessageDTO dto = new MessageDTO(savedMessage);
        messagingTemplate.convertAndSend("/topic/channel/" + channelId, dto);
    }

    @Transactional
    public void sendToContact(Long contactId, String content, User sender) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.isRequester(sender) && !contact.isTarget(sender)) {
            throw new IllegalStateException("You are not part of this contact");
        }
        if (!contact.isAccepted()) {
            throw new IllegalStateException("Contact must be ACCEPTED to send messages");
        }
        Conversation conversation = conversationRepository
                .findByContactId(contactId)
                .orElseGet(() -> {
                    Conversation c = Conversation.forDM(contact);
                    return conversationRepository.save(c);
                });
        Message savedMessage = messageRepository.save(
                new Message(sender, content, conversation)
        );
        MessageDTO dto = new MessageDTO(savedMessage);
        messagingTemplate.convertAndSend(
                "/topic/dm/" + contactId, dto
        );
        // Enviar notificación al recipient
        User recipient = contact.isRequester(sender) ? contact.getTarget() : contact.getRequester();
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(), "/queue/messages",
                new IncomingMessageNotificationDTO(contactId, sender.getId(), conversation.getId())
        );
    }

    public List<MessageDTO> getChannelMessages(Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        serverPermissionService.checkIsServerMember(channel.getServer().getId(), getAuthenticatedUser());
        if (channel.getProject() != null) {
            projectPermissionService.checkIsProjectMember(channel.getProject().getId(), getAuthenticatedUser().getId());
        }
        Conversation conversation = conversationRepository
                .findByChannelId(channelId)
                .orElseThrow(() -> new RuntimeException("Conversation for channel not found"));
        List<Message> messages = messageRepository
                .findByConversationIdOrderBySentAtAsc(conversation.getId());
        return messages.stream().map(this::messageToDTO).toList();
    }

    public List<MessageDTO> getContactMessages(Long contactId) {
        User authenticatedUser = getAuthenticatedUser();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.isRequester(authenticatedUser) && !contact.isTarget(authenticatedUser)) {
            throw new IllegalStateException("You are not part of this contact");
        }
        if (!contact.isAccepted()) {
            throw new IllegalStateException("Contact must be ACCEPTED to send messages");
        }
        Conversation conversation = conversationRepository
                .findByContactId(contactId)
                .orElseThrow(() -> new RuntimeException("Conversation for DM not found"));
        List<Message> messages = messageRepository
                .findByConversationIdOrderBySentAtAsc(conversation.getId());
        return messages.stream().map(this::messageToDTO).toList();
    }

    @Transactional
    public void markRead(Long conversationId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getConversation().getId().equals(conversationId)) {
            throw new IllegalStateException("Message does not belong to this conversation");
        }

        User user = getAuthenticatedUser();

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conv.getType() == ConversationType.DM) {
            Contact contact = conv.getContact();
            if (contact == null || !contact.isAccepted() || (!contact.isRequester(user) && !contact.isTarget(user))) {
                throw new IllegalStateException("Unauthorized access to conversation");
            }
        }

        ReadStatus rs = readStatusRepository.findByUserIdAndConversationId(user.getId(), conv.getId())
                .orElse(new ReadStatus());
        rs.setUser(user);
        rs.setConversation(conv);
        rs.setLastReadMessageId(messageId);
        readStatusRepository.save(rs);
    }

    public List<ConversationStatusDTO> getMyDMStatus() {
        User user = getAuthenticatedUser();

        List<Contact> acceptedContacts = contactRepository.findByUserIdAndStatus(user.getId(), ContactStatus.ACCEPTED);
        List<ConversationStatusDTO> statuses = new ArrayList<>();

        for (Contact contact : acceptedContacts) {
            Conversation conv = conversationRepository.findByContactId(contact.getId())
                    .orElseGet(() -> conversationRepository.save(Conversation.forDM(contact)));

            ReadStatus rs = readStatusRepository.findByUserIdAndConversationId(user.getId(), conv.getId()).orElse(null);

            Long lastReadId = rs != null ? rs.getLastReadMessageId() : null;
            boolean hasUnread = messageRepository.hasUnreadMessages(conv.getId(), user.getId(), lastReadId);
            User other = contact.isRequester(user) ? contact.getTarget() : contact.getRequester();
            UserDTO otherDTO = new UserDTO(other);
            ConversationStatusDTO dto = new ConversationStatusDTO(conv.getId(), contact.getId(), otherDTO, hasUnread);
            statuses.add(dto);
        }
        System.out.println(statuses);
        return statuses;
    }

    private MessageDTO messageToDTO(Message message) {
        return new MessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getContent(),
                message.getConversation().getId(),
                message.getSentAt()
        );
    }

    private User getAuthenticatedUser() {
        return userContextService.getAuthenticatedUser();
    }
}