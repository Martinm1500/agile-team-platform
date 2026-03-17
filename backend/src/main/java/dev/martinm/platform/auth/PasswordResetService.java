package dev.martinm.platform.auth;

import dev.martinm.platform.auth.repository.PasswordResetTokenRepository;
import dev.martinm.platform.users.User;

import dev.martinm.platform.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Calendar;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int EXPIRY_HOURS = 24;

    @Transactional
    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        passwordResetTokenRepository.deleteByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, EXPIRY_HOURS);
        resetToken.setExpiryDate(new Timestamp(cal.getTimeInMillis()));

        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findValidToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));

        resetToken.setUsed(true);

        userRepository.save(user);
        passwordResetTokenRepository.save(resetToken);
    }

}