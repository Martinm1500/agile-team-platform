package dev.martinm.platform.security;

public class MissingSecretKeyException extends RuntimeException{
    public MissingSecretKeyException(String message) {
        super(message);
    }
}

