package dev.martinm.platform.projects.repository;

import dev.martinm.platform.projects.ProjectInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {
}
