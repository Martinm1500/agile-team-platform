package dev.martinm.platform.servers.exceptions;

public final class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String entity, Long id) {
        super("%s with id %d not found".formatted(entity, id));
    }
}