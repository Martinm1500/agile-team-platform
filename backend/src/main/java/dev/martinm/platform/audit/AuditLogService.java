package dev.martinm.platform.audit;

import dev.martinm.platform.auth.UserContextService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    private final UserContextService userContextService;

    public AuditLogService(AuditLogRepository auditLogRepository, UserContextService userContextService) {
        this.auditLogRepository = auditLogRepository;
        this.userContextService = userContextService;
    }

    public AuditLog logAction(AuditLogDTO dto) {
        AuditLog log = new AuditLog();
        log.setUser(userContextService.getAuthenticatedUser());
        log.setAction(dto.getAction());
        log.setEntityType(dto.getEntityType());
        log.setEntityId(dto.getEntityId());
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsForEntity(String entityType, Long entityId) {
        // Asume permiso admin o owner, ajusta según lógica
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
}
