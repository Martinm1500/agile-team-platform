package dev.martinm.platform.notifications;

import lombok.Data;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private Long relatedId;
    private Long relatedServerId;
    private Long relatedProjectId;
    private boolean isRead;
    private NotificationType type;

    public NotificationDTO(Notification notification){
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.relatedId = notification.getRelatedId();
        this.relatedServerId = notification.getRelatedServerId();
        this.relatedProjectId = notification.getRelatedProjectId();
        this.isRead = notification.getIsRead();
        this.type = notification.getType();
    }
}
