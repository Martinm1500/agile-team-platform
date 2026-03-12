package dev.martinm.platform.projects.dto;

import dev.martinm.platform.projects.ProjectMember;
import lombok.Data;

@Data
public class ProjectMemberDTO {
    private Long projectId;
    private Long userId;
    private Long specialtyId;
    private String username;
    private String avatarUrl;

    public ProjectMemberDTO(ProjectMember projectMember){
        this.projectId = projectMember.getId().getProjectId();
        this.userId = projectMember.getId().getUserId();
        this.specialtyId = projectMember.getSpecialty().getId();
        this.username = projectMember.getUser().getUsername();
        this.avatarUrl = projectMember.getUser().getAvatarUrl();
    }

    public ProjectMemberDTO(){}
}
