package dev.martinm.platform.users.controller;

import dev.martinm.platform.contacts.UserDTO;
import dev.martinm.platform.users.SettingsService;
import dev.martinm.platform.users.UserService;
import dev.martinm.platform.users.dto.ProfileDTO;
import dev.martinm.platform.users.dto.SettingsDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SettingsService settingsService;

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @GetMapping("/me/settings")
    public ResponseEntity<SettingsDTO> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileDTO> updateProfile(@Valid @RequestBody ProfileDTO updateDTO) {
        return ResponseEntity.ok(userService.updateProfile(updateDTO));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<SettingsDTO> updateSettings(@Valid @RequestBody SettingsDTO settingsDTO) {
        return ResponseEntity.ok(settingsService.updateSettings(settingsDTO));
    }

    @GetMapping
    public ResponseEntity<UserDTO> getByUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }


    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAcount();
        return ResponseEntity.noContent().build();
    }
}