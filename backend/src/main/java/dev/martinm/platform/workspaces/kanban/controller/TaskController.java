package dev.martinm.platform.workspaces.kanban.controller;

import dev.martinm.platform.workspaces.kanban.TaskService;
import dev.martinm.platform.workspaces.kanban.dto.TaskDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping("/kanban/{kanbanId}")
    public ResponseEntity<List<TaskDTO>> getAllTasksForKanban(@PathVariable Long kanbanId) {
        return ResponseEntity.ok(taskService.getAllTasksByKanbanId(kanbanId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> editTask(@PathVariable Long id, @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.editTask(id, dto));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(@PathVariable Long id, @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.moveTask(id, dto));
    }

    @PutMapping("/{id}/assign/{userId}")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(taskService.assignTask(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
