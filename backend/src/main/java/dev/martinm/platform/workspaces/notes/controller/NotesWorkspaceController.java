package dev.martinm.platform.workspaces.notes.controller;

import dev.martinm.platform.workspaces.notes.NotesWorkspaceService;
import dev.martinm.platform.workspaces.notes.dto.NotesWorkspaceDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes-workspaces")
public class NotesWorkspaceController {

    private final NotesWorkspaceService notesWorkspaceService;

    public NotesWorkspaceController(NotesWorkspaceService notesWorkspaceService) {
        this.notesWorkspaceService = notesWorkspaceService;
    }

    @PostMapping
    public ResponseEntity<NotesWorkspaceDTO> createWorkspace(@RequestBody NotesWorkspaceDTO dto) {
        return ResponseEntity.ok(notesWorkspaceService.createWorkspace(dto));
    }

    @GetMapping
    public ResponseEntity<List<NotesWorkspaceDTO>> getAllWorkspaces() {
        return ResponseEntity.ok(notesWorkspaceService.getAllWorkspaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotesWorkspaceDTO> getWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(notesWorkspaceService.getWorkspaceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotesWorkspaceDTO> updateWorkspace(
            @PathVariable Long id,
            @RequestBody NotesWorkspaceDTO dto
    ) {
        return ResponseEntity.ok(notesWorkspaceService.updateWorkspace(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id) {
        notesWorkspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }
}
