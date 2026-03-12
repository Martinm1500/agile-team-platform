package dev.martinm.platform.contacts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    @Query("SELECT c FROM Contact c WHERE "
            + "(c.requester.id = :userId1 AND c.target.id = :userId2) OR "
            + "(c.requester.id = :userId2 AND c.target.id = :userId1)")
    Optional<Contact> findByUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT c FROM Contact c WHERE (c.requester.id = :userId OR c.target.id = :userId) AND c.status = 'ACCEPTED'")
    List<Contact> findAcceptedByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Contact c WHERE (c.requester.id = :userId OR c.target.id = :userId) AND c.status = 'BLOCKED' AND c.blockedBy.id = :userId")
    List<Contact> findBlockedByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Contact c WHERE c.target.id = :userId AND c.status = 'PENDING'")
    List<Contact> findIncomingPendingByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Contact c WHERE c.requester.id = :userId AND c.status = 'PENDING'")
    List<Contact> findOutgoingPendingByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Contact c WHERE c.status = :status AND (c.requester.id = :userId OR c.target.id = :userId)")
    List<Contact> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ContactStatus status);
}