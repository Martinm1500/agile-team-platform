package dev.martinm.platform.projects.dto;

import dev.martinm.platform.users.User;
import lombok.Data;

@Data
public class ProjectCreatorDTO {
    private Long projectId;
    private Long userId;
    private String username;
    private String avatarUrl;

    public ProjectCreatorDTO(Long projectId, User user) {
        this.projectId = projectId;
        this.userId = user.getId();
        this.username = user.getUsername();
        this.avatarUrl = user.getAvatarUrl();
    }
}
