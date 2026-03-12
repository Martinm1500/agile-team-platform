package dev.martinm.platform.users.dto;

import dev.martinm.platform.users.Status;
import dev.martinm.platform.users.User;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileDTO {
    private Long userId;
    private String username;
    private String email;
    private String password;
    private String displayname;
    private Status status;

    @Size(max = 200)
    @Pattern(regexp = "^https?://.*$", message = "Avatar URL must be a valid URL")
    private String avatarUrl;

    public ProfileDTO(User user){
        this.userId = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.displayname = user.getDisplayname();
        this.avatarUrl = user.getAvatarUrl();
        this.status = user.getStatus();
    }
}

