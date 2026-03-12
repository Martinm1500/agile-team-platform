package dev.martinm.platform.exception;

import lombok.Getter;

@Getter
public class PermissionDeniedException extends RuntimeException {
    private final String resourceType;
    private final Long resourceId;
    private final String permission;

    public PermissionDeniedException(String resourceType, Long resourceId, String permission) {
        super("No permission '%s' for %s with ID: %d".formatted(permission, resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.permission = permission;
    }
}