package dev.martinm.platform.messages.dto;

import lombok.Data;

@Data
public class IncomingMessageNotificationDTO {
    private Long contactId;
    private Long senderId;
    private Long conversationId;

    public IncomingMessageNotificationDTO(Long contactId, Long senderId, Long conversationId) {
        this.contactId = contactId;
        this.senderId = senderId;
        this.conversationId = conversationId;
    }
}