package dev.martinm.platform.messages.dto;

import dev.martinm.platform.messages.Message;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String content;
    private Long conversationId;
    private Timestamp sentAt;

    public MessageDTO(Message message){
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.conversationId = message.getConversation().getId();
        this.senderUsername = message.getSender().getUsername();
        this.content = message.getContent();

        this.sentAt = message.getSentAt();
    }
}
