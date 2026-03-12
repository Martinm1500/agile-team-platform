package dev.martinm.platform.messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReadStatusRepository extends JpaRepository<ReadStatus, Long> {

    @Query("SELECT rs FROM ReadStatus rs WHERE rs.user.id = :userId AND rs.conversation.id = :conversationId")
    Optional<ReadStatus> findByUserIdAndConversationId(@Param("userId") Long userId,
                                                       @Param("conversationId") Long conversationId);
}
