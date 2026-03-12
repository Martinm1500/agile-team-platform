package dev.martinm.platform.projects.controller;

import dev.martinm.platform.projects.SpecialtyService;
import dev.martinm.platform.projects.dto.SpecialtyDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
public class SpecialtyController {
    private final SpecialtyService specialtyService;

    public SpecialtyController(SpecialtyService specialtyService) {
        this.specialtyService = specialtyService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialtyDTO> getSpecialtyById(@PathVariable Long id) {
        return ResponseEntity.ok(specialtyService.getSpecialtyById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SpecialtyDTO>> getAllSpecialtiesForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(specialtyService.getAllSpecialtiesForProject(projectId));
    }
}