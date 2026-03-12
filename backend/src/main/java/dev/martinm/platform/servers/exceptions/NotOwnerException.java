package dev.martinm.platform.servers.exceptions;

public class NotOwnerException extends RuntimeException {
    public NotOwnerException(String resourceType, Long resourceId) {
        super("Not the owner of %s with ID: %d".formatted(resourceType, resourceId));
    }
}