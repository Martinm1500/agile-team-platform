package dev.martinm.platform.messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByContactId(Long contactId);

    Optional<Conversation> findByChannelId(Long channelId);

    List<Conversation> findAllByChannel_Server_Id(Long serverId);

}

