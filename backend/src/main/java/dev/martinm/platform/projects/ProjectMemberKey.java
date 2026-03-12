package dev.martinm.platform.projects;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class ProjectMemberKey implements Serializable {
    private Long projectId;
    private Long userId;

    public ProjectMemberKey(Long projectId, Long userId){
        this.projectId = projectId;
        this.userId=userId;
    }

    public ProjectMemberKey(){}
}
