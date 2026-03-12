package dev.martinm.platform.messages.dto;

import dev.martinm.platform.contacts.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConversationStatusDTO {
    private Long conversationId;
    private Long contactId;
    private UserDTO otherUser;
    private boolean hasUnread;
}
