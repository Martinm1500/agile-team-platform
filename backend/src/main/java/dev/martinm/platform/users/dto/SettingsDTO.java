package dev.martinm.platform.users.dto;

import dev.martinm.platform.users.Settings;
import lombok.Data;

@Data
public class SettingsDTO {
    private Long userId;
    private boolean showCurrentActivity;
    private boolean allowDmsFromContacts;

    public SettingsDTO(Long userId, Settings settings){
        this.userId = userId;
        this.allowDmsFromContacts = settings.isAllowDmsFromContacts();
        this.showCurrentActivity = settings.isShowCurrentActivity();
    }

    public SettingsDTO(){}
}
