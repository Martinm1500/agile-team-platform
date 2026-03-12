package dev.martinm.platform.audit;

import lombok.Data;

@Data
public class AuditLogDTO {
    private Long userId;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;  // JSON string
}
