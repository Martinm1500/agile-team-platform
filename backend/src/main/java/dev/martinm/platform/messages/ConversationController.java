package dev.martinm.platform.messages;

import dev.martinm.platform.messages.dto.ConversationDTO;
import dev.martinm.platform.messages.dto.ConversationStatusDTO;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@AllArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;
    private final MessageService messageService;

    @GetMapping("/dm/{contactId}")
    public ConversationDTO getDMConversation(@PathVariable Long contactId) {
        Conversation conv = conversationService.getOrCreateConversationForDM(contactId);
        return new ConversationDTO(conv);
    }

    @GetMapping("/server/{serverId}")
    public List<ConversationDTO> getServerConversations(@PathVariable Long serverId){
        List<ConversationDTO> dtos = new ArrayList<>();
        List<Conversation> conversations = conversationService.getConversationForServerId(serverId);
        for(Conversation c : conversations){
            dtos.add(new ConversationDTO(c));
        }
        return dtos;
    }

    @GetMapping("/{channelId}")
    public ConversationDTO getConversationByChannelId(@PathVariable Long channelId){
        return new ConversationDTO(conversationService.getConversationByChannelId(channelId));
    }

    @GetMapping("/my/dms")
    public List<ConversationStatusDTO> getMyDMConversations() {
        return messageService.getMyDMStatus();
    }
}