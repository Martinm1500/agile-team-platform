package dev.martinm.platform.contacts.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidContactOperationException extends RuntimeException {
    public InvalidContactOperationException(String message) {
        super(message);
    }
}
