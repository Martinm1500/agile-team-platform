package dev.martinm.platform.servers.exceptions;

public class InvitationNotFoundException extends RuntimeException {
    public InvitationNotFoundException(String message) {
        super(message);
    }
}