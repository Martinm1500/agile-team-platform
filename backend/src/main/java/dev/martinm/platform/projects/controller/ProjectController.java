package dev.martinm.platform.projects.controller;

import dev.martinm.platform.projects.Project;
import dev.martinm.platform.projects.ProjectService;
import dev.martinm.platform.projects.dto.ProjectDTO;
import dev.martinm.platform.projects.dto.ProjectFullDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/servers/{serverId}/projects")
    public ResponseEntity<ProjectFullDTO> createProject(
            @PathVariable Long serverId,
            @RequestBody ProjectDTO dto) {
        dto.setServerId(serverId);
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/servers/{serverId}/projects")
    public ResponseEntity<List<ProjectFullDTO>> getAllProjectsForServer(@PathVariable Long serverId) {
        return ResponseEntity.ok(projectService.getAllProjectsForServer(serverId));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        System.out.println("PROJECT ELIMINATED");
        return ResponseEntity.noContent().build();
    }
}
