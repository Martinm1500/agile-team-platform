package dev.martinm.platform.projects;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "project_members")
@Data
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberKey id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId")
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    @CreationTimestamp
    private Timestamp joinDate;

    public ProjectMember(ProjectMemberKey key, Project project, User user, Specialty specialty){
        this.id = key;
        this.project = project;
        this.user = user;
        this.specialty = specialty;
    }

    public ProjectMember(){}
}
