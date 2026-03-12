package dev.martinm.platform.contacts.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ContactExceptionHandler {

    @ExceptionHandler({ ContactAlreadyExistsException.class,
            ContactNotFoundException.class,
            InvalidContactOperationException.class,
            UnauthorizedActionException.class })
    public ResponseEntity<Map<String, String>> handleCustomExceptions(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
