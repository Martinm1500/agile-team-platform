package dev.martinm.platform.messages;

import lombok.Data;

@Data
public class ConversationDTO {
    private Long id;
    private ConversationType type;
    private Long contactId;
    private Long channelId;

    public ConversationDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.type = conversation.getType();
        if(conversation.getContact()!=null){
            this.contactId = conversation.getContact().getId();
        }
        if(conversation.getChannel() !=null){
            this.channelId = conversation.getChannel().getId();
        }
    }
}
