package dev.martinm.platform.workspaces.notes.controller;

import dev.martinm.platform.workspaces.notes.NoteService;
import dev.martinm.platform.workspaces.notes.dto.NoteDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // Crear una nota dentro de un workspace específico
    @PostMapping("/notes-workspaces/{workspaceId}/notes")
    public ResponseEntity<NoteDTO> createNote(
            @PathVariable Long workspaceId,
            @RequestBody NoteDTO dto
    ) {
        dto.setWorkspaceId(workspaceId);
        return ResponseEntity.ok(noteService.createNote(dto));
    }

    // Obtener todas las notas de un workspace
    @GetMapping("/notes-workspaces/{workspaceId}/notes")
    public ResponseEntity<List<NoteDTO>> getAllNotesForWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(noteService.getAllNotesForWorkspace(workspaceId));
    }

    // Obtener una nota específica
    @GetMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    // Actualizar una nota completa
    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> updateNote(
            @PathVariable Long id,
            @RequestBody NoteDTO dto
    ) {
        dto.setId(id);
        return ResponseEntity.ok(noteService.editNote(dto));
    }

    // Actualización parcial (por ejemplo, mover de workspace)
    @PatchMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> partiallyUpdateNote(
            @PathVariable Long id,
            @RequestBody NoteDTO dto
    ) {
        dto.setId(id);
        return ResponseEntity.ok(noteService.moveNote(dto));
    }

    // Eliminar una nota
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
