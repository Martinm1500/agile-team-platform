package dev.martinm.platform.auth;

import dev.martinm.platform.auth.dto.*;
import dev.martinm.platform.users.SettingsService;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import dev.martinm.platform.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SettingsService settingsService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(@Valid LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UsernameNotFoundException("Username Not Found."));

        TokenPair tokenPair = jwtService.generateTokenPair(user.getUsername());
        return new AuthResponse(tokenPair.accessToken(), tokenPair.refreshToken());
    }

    @Transactional
    public AuthResponse register(@Valid RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User(request.username(), request.email(), passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);

        settingsService.createSettings(savedUser);

        TokenPair tokenPair = jwtService.generateTokenPair(user.getUsername());
        return new AuthResponse(tokenPair.accessToken(), tokenPair.refreshToken());
    }

    public String refreshToken(@Valid RefreshRequest request) {
        return jwtService.refreshAccessToken(request.refreshToken());
    }

    public void logout(String token) {
        tokenBlacklistService.blacklistToken(token);
    }
}