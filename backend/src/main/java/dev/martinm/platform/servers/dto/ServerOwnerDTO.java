package dev.martinm.platform.servers.dto;

import dev.martinm.platform.users.User;
import lombok.Data;

@Data
public class ServerOwnerDTO {
    private Long id;
    private String username;
    private String avatarUrl;

    public ServerOwnerDTO(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.avatarUrl = user.getAvatarUrl();
    }
}
