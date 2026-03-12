package dev.martinm.platform.messages;

import dev.martinm.platform.messages.dto.SendMessageDTO;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class MessageStompController {
    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageStompController(MessageService messageService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/send/channel/{channelId}")
    public void sendToChannel(@DestinationVariable Long channelId, @Payload SendMessageDTO dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        messageService.sendToChannel(channelId, dto.getContent(),user);
    }

    @MessageMapping("/send/dm/{contactId}")
    public void sendToContact(@DestinationVariable Long contactId, @Payload SendMessageDTO dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        messageService.sendToContact(contactId, dto.getContent(), user);
    }
}