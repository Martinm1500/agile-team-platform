package dev.martinm.platform.workspaces.kanban.controller;

import dev.martinm.platform.workspaces.kanban.KanbanWorkspaceService;
import dev.martinm.platform.workspaces.kanban.dto.KanbanWorkspaceDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanban-workspaces")
public class KanbanWorkspaceController {
    private final KanbanWorkspaceService kanbanWorkspaceService;

    public KanbanWorkspaceController(KanbanWorkspaceService kanbanWorkspaceService) {
        this.kanbanWorkspaceService = kanbanWorkspaceService;
    }

    @PostMapping
    public ResponseEntity<KanbanWorkspaceDTO> createStandaloneWorkspace(@RequestBody KanbanWorkspaceDTO dto) {
        return ResponseEntity.ok(kanbanWorkspaceService.createWorkspace(dto.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KanbanWorkspaceDTO> getKanbanWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(kanbanWorkspaceService.getWorkspaceById(id));
    }

    @GetMapping
    public ResponseEntity<List<KanbanWorkspaceDTO>> getAll(){
        return ResponseEntity.ok(kanbanWorkspaceService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<KanbanWorkspaceDTO> updateKanbanWorkspace(@PathVariable Long id, @RequestBody KanbanWorkspaceDTO dto) {
        return ResponseEntity.ok(kanbanWorkspaceService.updateWorkspace(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKanbanWorkspace(@PathVariable Long id) {
        kanbanWorkspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }
}
