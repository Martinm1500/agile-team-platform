package dev.martinm.platform.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendPasswordResetEmail(String email, String resetToken) {
        // En producción, aquí integrarías con un servicio de email real
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;

        log.info("=== PASSWORD RESET EMAIL ===");
        log.info("To: {}", email);
        log.info("Subject: Password Reset Request");
        log.info("Reset Link: {}", resetLink);
        log.info("=== END EMAIL ===");

        // Simular envío de email
        // emailSender.send(new SimpleMailMessage());
    }
}