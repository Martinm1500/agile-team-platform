package dev.martinm.platform.messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);

    @Query("SELECT CASE WHEN (COUNT(m) > 0) THEN true ELSE false END " +
            "FROM Message m " +
            "WHERE m.conversation.id = :convId " +
            "AND m.sender.id <> :userId " +
            "AND (:lastReadMessageId IS NULL OR m.id > :lastReadMessageId)")
    boolean hasUnreadMessages(@Param("convId") Long convId,
                              @Param("userId") Long userId,
                              @Param("lastReadMessageId") Long lastReadMessageId);

}
