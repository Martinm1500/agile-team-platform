package dev.martinm.platform.projects.repository;

import dev.martinm.platform.projects.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    List<Specialty> findByProjectId(Long projectId);

    Optional<Specialty> findByProjectIdAndName(Long projectId, String name);
}
