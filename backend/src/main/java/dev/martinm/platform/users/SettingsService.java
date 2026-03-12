package dev.martinm.platform.users;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.users.dto.SettingsDTO;
import dev.martinm.platform.users.repository.SettingsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;
    private final UserContextService userContextService;

    public void createSettings(User user){
        Settings settings = new Settings(user);
        settingsRepository.save(settings);
    }

    public SettingsDTO updateSettings(SettingsDTO dto) {
        Long userId = getAuthenticatedUser().getId();
        if (!userId.equals(dto.getUserId())) {
            throw new RuntimeException("Can only update own settings");
        }
        Settings settings = settingsRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("Settings not found")
        );

        settings.setShowCurrentActivity(dto.isShowCurrentActivity());
        settings.setAllowDmsFromContacts(dto.isAllowDmsFromContacts());

        return new SettingsDTO(userId, settingsRepository.save(settings));
    }

    public SettingsDTO getSettings() {
        Long authenticatedUserId = getAuthenticatedUser().getId();

        Settings userSettings = settingsRepository.findByUserId(authenticatedUserId).orElseThrow(
                () -> new RuntimeException("Settings not found"));

        return new SettingsDTO(authenticatedUserId, userSettings);
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
