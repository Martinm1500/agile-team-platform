package dev.martinm.platform.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.relatedId = :relatedId")
    List<Notification> findByUserIdAndRelatedId(@Param("userId") Long userId, @Param("relatedId") Long relatedId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.relatedServerId = :relatedServerId")
    List<Notification> findByUserIdAndRelatedServerId(@Param("userId") Long userId, @Param("relatedServerId") Long relatedServerId);

    @Query("SELECT n FROM Notification n WHERE n.id = :id AND n.user.id = :userId")
    Optional<Notification> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    List<Notification> findByUserIdAndIsReadFalse(@Param("userId") Long userId);
}