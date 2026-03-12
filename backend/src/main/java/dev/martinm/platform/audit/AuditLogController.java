package dev.martinm.platform.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<AuditLog> logAction(@RequestBody AuditLogDTO dto) {
        return ResponseEntity.ok(auditLogService.logAction(dto));
    }

    @GetMapping("/entity")
    public ResponseEntity<List<AuditLog>> getLogsForEntity(@RequestParam String entityType, @RequestParam Long entityId) {
        return ResponseEntity.ok(auditLogService.getLogsForEntity(entityType, entityId));
    }
}
