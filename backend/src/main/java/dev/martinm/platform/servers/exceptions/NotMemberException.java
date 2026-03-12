package dev.martinm.platform.servers.exceptions;

public class NotMemberException extends RuntimeException {
    public NotMemberException(String resourceType, Long resourceId) {
        super("Not a member of %s with ID: %d".formatted(resourceType, resourceId));
    }
}
