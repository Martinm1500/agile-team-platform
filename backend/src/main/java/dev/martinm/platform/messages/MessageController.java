package dev.martinm.platform.messages;

import dev.martinm.platform.messages.dto.MarkReadDTO;
import dev.martinm.platform.messages.dto.MessageDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/channels/{channelId}/messages")
    public List<MessageDTO> getChannelMessages(@PathVariable Long channelId) {
        return messageService.getChannelMessages(channelId);
    }

    @GetMapping("/contacts/{contactId}/messages")
    public List<MessageDTO> getContactMessages(@PathVariable Long contactId) {
        return messageService.getContactMessages(contactId);
    }

    @PostMapping("/mark-read/{conversationId}")
    public void markRead(@PathVariable Long conversationId, @RequestBody MarkReadDTO dto) {
        messageService.markRead(conversationId, dto.getMessageId());
    }
}