package dev.martinm.platform.notifications;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.contacts.Contact;
import dev.martinm.platform.projects.ProjectInvitation;
import dev.martinm.platform.servers.RequestToJoin;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.ServerInvitation;
import dev.martinm.platform.servers.repository.ServerInvitationRepository;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ServerInvitationRepository serverInvitationRepository;
    private final UserContextService userContextService;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendServerInvitationNotification(ServerInvitation serverInvitation) {
        Long invitedUserId = serverInvitation.getInvitedUser().getId();

        User invitedUser = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long serverId = serverInvitation.getServer().getId();
        String inviterUsername = serverInvitation.getCreatedBy().getUsername();
        String serverName = serverInvitation.getServer().getName();

        String title = "Invitación a Servidor";
        String message = String.format(
                "%s te invitó al servidor '%s'",
                inviterUsername,
                serverName
        );

        Long relatedId = serverInvitation.getId();

        List<Notification> notifications =
                notificationRepository.findByUserIdAndRelatedServerId(
                        getAuthenticatedUser().getId(),
                        serverId
                );

        for (Notification n : notifications) {
            if (n.getType() == NotificationType.REQUEST_TO_JOIN) {
                notificationRepository.delete(n);
            }
        }

        Notification notification = new Notification(
                invitedUser,
                title,
                message,
                relatedId,
                NotificationType.SERVER_INVITATION,
                serverId
        );

        notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                invitedUser.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void sendContactInvitationNotification(Contact contact) {
        Long invitedUserId = contact.getTarget().getId();

        User invitedUser = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String inviterUsername = contact.getRequester().getUsername();
        String title = "Invitación de contacto";
        String message = String.format(
                "%s quiere ser tu amigo",
                inviterUsername
        );

        Long relatedId = contact.getId();

        Notification notification = new Notification(
                invitedUser,
                title,
                message,
                relatedId,
                NotificationType.CONTACT_INVITATION
        );

        notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                invitedUser.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void sendProjectInvitationNotification(ProjectInvitation projectInvitation) {
        Long invitedUserId = projectInvitation.getInvitedUser().getId();

        User invitedUser = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String inviterUsername = projectInvitation.getCreatedBy().getUsername();
        String serverName = projectInvitation.getServer().getName();
        String projectName = projectInvitation.getProject().getName();

        String title = "Invitación a Proyecto";
        String message = String.format(
                "%s te invitó a unirte al proyecto \"%s\" en el servidor %s",
                inviterUsername,
                projectName,
                serverName
        );

        Long relatedId = projectInvitation.getId();
        Long projectId = projectInvitation.getProject().getId();

        Notification notification = new Notification(
                invitedUser,
                title,
                message,
                relatedId,
                NotificationType.PROJECT_INVITATION,
                projectInvitation.getServer().getId(),
                projectId
        );

        notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                invitedUser.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void informInvitationAccepted(
            User user,
            String senderUsername,
            Long relatedId,
            Long relatedServerId,
            Long relatedProjectId,
            NotificationType notificationType
    ) {
        String title = "Invitation accepted";
        Notification notification = null;

        if (notificationType.equals(NotificationType.CONTACT_INVITATION_ACCEPTED)) {
            String message = String.format(
                    "%s accepted your contact request.",
                    senderUsername
            );
            notification = new Notification(
                    user,
                    title,
                    message,
                    relatedId,
                    notificationType
            );
            notificationRepository.save(notification);
        }

        if (notificationType.equals(NotificationType.SERVER_INVITATION_ACCEPTED)) {
            String message = String.format(
                    "%s accepted your server request.",
                    senderUsername
            );
            notification = new Notification(
                    user,
                    title,
                    message,
                    relatedId,
                    notificationType,
                    relatedServerId
            );
            notificationRepository.save(notification);
        }

        if (notificationType.equals(NotificationType.PROJECT_INVITATION_ACCEPTED)) {
            String message = String.format(
                    "%s accepted your project request.",
                    senderUsername
            );
            notification = new Notification(
                    user,
                    title,
                    message,
                    relatedId,
                    notificationType,
                    relatedServerId,
                    relatedProjectId
            );
            notificationRepository.save(notification);
        }

        if (notification != null) {
            NotificationDTO dto = new NotificationDTO(notification);
            messagingTemplate.convertAndSendToUser(
                    user.getUsername(),
                    "/queue/notifications",
                    dto
            );
        }
    }

    public void informRequestToJoinAccepted(RequestToJoin request) {
        String title = "Request accepted";
        String message = String.format(
                "You are now part of the %s server.",
                request.getServer().getName()
        );

        Notification notification = new Notification(
                request.getRequester(),
                title,
                message,
                request.getId(),
                NotificationType.REQUEST_TO_JOIN_ACCEPTED
        );

        notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                request.getRequester().getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void readInvitationNotification(Long userId, Long relatedId, String status) {
        List<Notification> notifications =
                notificationRepository.findByUserIdAndRelatedId(userId, relatedId);

        for (Notification notification : notifications) {
            notification.read();
            notification.setStatus(status);
            notificationRepository.save(notification);
        }
    }

    public void sendRequestToJoinNotification(RequestToJoin request) {
        String requesterName = getAuthenticatedUser().getUsername();
        Server server = request.getServer();

        String title = "Solicitud de union";
        String message = String.format(
                "%s quiere unirse a tu servidor: %s",
                requesterName,
                server.getName()
        );

        List<Notification> notifications =
                notificationRepository.findByUserIdAndRelatedServerId(
                        getAuthenticatedUser().getId(),
                        server.getId()
                );

        for (Notification n : notifications) {
            if (n.getType() == NotificationType.SERVER_INVITATION) {
                serverInvitationRepository.deleteById(n.getRelatedId());
                notificationRepository.delete(n);
            }
        }

        Notification notification = new Notification(
                server.getOwner(),
                title,
                message,
                request.getId(),
                NotificationType.REQUEST_TO_JOIN,
                server.getId()
        );

        notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                server.getOwner().getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public List<NotificationDTO> getUserNotifications() {
        Long authenticatedUserId = getAuthenticatedUser().getId();

        List<Notification> notifications =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(authenticatedUserId);

        List<NotificationDTO> notificationDTOS = new ArrayList<>();

        for (Notification notification : notifications) {
            notificationDTOS.add(new NotificationDTO(notification));
        }

        return notificationDTOS;
    }

    public List<NotificationDTO> getUnreadNotifications() {
        Long authenticatedUserId = getAuthenticatedUser().getId();

        List<Notification> notifications =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                        authenticatedUserId
                );

        List<NotificationDTO> notificationDTOS = new ArrayList<>();

        for (Notification notification : notifications) {
            notificationDTOS.add(new NotificationDTO(notification));
        }

        return notificationDTOS;
    }

    public void sendContactRemovedNotification(Contact contact) {
        User remover = getAuthenticatedUser();
        User otherUser = (contact.getRequester().getId().equals(remover.getId())) ? contact.getTarget() : contact.getRequester();
        String title = "Contacto eliminado";
        String message = String.format("%s ya no forma parte de tus contactos.", remover.getUsername());
        Long relatedId = contact.getId();
        Notification notification = new Notification(
                otherUser,
                title,
                message,
                relatedId,
                NotificationType.CONTACT_REMOVED
        );
        notificationRepository.save(notification);
        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                otherUser.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void sendMemberRemovedNotification(Long serverId, Long userId){
        String title = "Miembro eliminado";
        String message = "Miembro eliminado de servidor";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification(
                user,
                title,
                message,
                serverId,
                NotificationType.SERVER_MEMBER_REMOVED,
                serverId
        );
        notificationRepository.save(notification);
        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public void sendProjectMemberRemovedNotification(Long serverId,Long projectId, Long userId){
        String title = "Miembro eliminado";
        String message = "Miembro de proyecto eliminado";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification(
                user,
                title,
                message,
                projectId,
                NotificationType.PROJECT_MEMBER_REMOVED,
                serverId,
                projectId
        );
        notificationRepository.save(notification);
        NotificationDTO dto = new NotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public Long getUnreadCount() {
        Long authenticatedUserId = getAuthenticatedUser().getId();
        return notificationRepository.countByUserIdAndIsReadFalse(authenticatedUserId);
    }

    public void markAsRead(Long notificationId) {
        Long authenticatedUserId = getAuthenticatedUser().getId();

        Notification notification =
                notificationRepository.findByIdAndUserId(
                                notificationId,
                                authenticatedUserId
                        )
                        .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        Long authenticatedUserId = getAuthenticatedUser().getId();

        List<Notification> notifications =
                notificationRepository.findByUserIdAndIsReadFalse(authenticatedUserId);

        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    private User getAuthenticatedUser() {
        return userContextService.getAuthenticatedUser();
    }
}