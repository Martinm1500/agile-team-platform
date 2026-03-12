package dev.martinm.platform.servers.exceptions;

public class ServerNotFoundException extends RuntimeException {

    public ServerNotFoundException(String server, Long id) {
        super("%s with id %d not found".formatted(server, id));
    }
}
