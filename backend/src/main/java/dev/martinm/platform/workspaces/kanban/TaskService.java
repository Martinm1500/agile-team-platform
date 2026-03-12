package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.projects.ProjectPermissionService;
import dev.martinm.platform.projects.types.KanbanPermissionType;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import dev.martinm.platform.workspaces.kanban.dto.TaskDTO;
import dev.martinm.platform.workspaces.kanban.repository.ColumnRepository;
import dev.martinm.platform.workspaces.kanban.repository.KanbanWorkspaceRepository;
import dev.martinm.platform.workspaces.kanban.repository.TaskRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final KanbanWorkspaceRepository kanbanWorkspaceRepository;
    private final ColumnRepository kanbanColumnRepository;
    private final UserRepository userRepository;
    private final ProjectPermissionService projectPermissionService;
    private final UserContextService userContextService;

    public TaskDTO createTask(TaskDTO dto) {
        if (dto == null) throw new IllegalArgumentException("TaskDTO cannot be null");
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty())
            throw new IllegalArgumentException("Task title cannot be empty");
        if (dto.getKanbanId() == null || dto.getColumnId() == null)
            throw new IllegalArgumentException("KanbanId and ColumnId cannot be null");

        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(dto.getKanbanId())
                .orElseThrow(() -> new RuntimeException("Kanban workspace not found"));
        Column column = kanbanColumnRepository.findById(dto.getColumnId())
                .orElseThrow(() -> new RuntimeException("Column not found"));

        if (workspace.getProject() != null) {
            Long projectId = workspace.getProject().getId();
            Long userId = getAuthenticatedUser().getId();
            projectPermissionService.checkKanbanPermission(projectId, userId, KanbanPermissionType.CREATE_TASK);

            Task task = new Task(workspace, dto.getTitle(), dto.getDescription(), column, getAuthenticatedUser());
            return new TaskDTO(taskRepository.save(task));
        } else {
            if (!workspace.isCreator(getAuthenticatedUser())) {
                throw new RuntimeException("User is not the workspace creator");
            }
            Task task = new Task(workspace, dto.getTitle(), dto.getDescription(), column);
            return new TaskDTO(taskRepository.save(task));
        }
    }

    public TaskDTO getTaskById(Long id) {
        if (id == null || id <= 0)
            throw new IllegalArgumentException("Invalid task ID");

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(task.getKanban().getId())
                .orElseThrow(() -> new RuntimeException("Kanban workspace not found"));

        if (workspace.getProject() != null) {
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        } else if (!workspace.isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the kanban creator");
        }
        return new TaskDTO(task);
    }

    public List<TaskDTO> getAllTasksByKanbanId(Long kanbanId) {
        if (kanbanId == null || kanbanId <= 0)
            throw new IllegalArgumentException("Invalid kanban ID");

        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(kanbanId)
                .orElseThrow(() -> new RuntimeException("Kanban not found"));

        if (workspace.getProject() != null) {
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        } else if (!workspace.isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the kanban creator");
        }

        return convertToTasksListDTO(taskRepository.findByKanbanId(kanbanId));
    }

    public TaskDTO editTask(Long id, TaskDTO dto) {
        if (dto == null) throw new IllegalArgumentException("TaskDTO cannot be null");
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty())
            throw new IllegalArgumentException("Task title cannot be empty");

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getKanban().getProject() != null) {
            projectPermissionService.checkKanbanPermission(
                    task.getKanban().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    KanbanPermissionType.EDIT_TASK
            );
        }else if (!task.getKanban().isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the kanban creator");
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        return new TaskDTO(taskRepository.save(task));
    }

    public TaskDTO moveTask(Long id, TaskDTO dto) {
        if (dto == null || dto.getColumnId() == null)
            throw new IllegalArgumentException("Column ID is required to move the task");

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getKanban().getProject() != null) {
            projectPermissionService.checkKanbanPermission(
                    task.getKanban().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    KanbanPermissionType.MOVE_TASK
            );
        }else if (!task.getKanban().isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the kanban creator");
        }

        Column target = kanbanColumnRepository.findById(dto.getColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        task.setColumn(target);
        task.setStatus(target.getStatus());
        return new TaskDTO(taskRepository.save(task));
    }

    public TaskDTO assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getKanban().getProject() == null)
            throw new RuntimeException("Cannot assign a task outside of a project");

        Long projectId = task.getKanban().getProject().getId();

        projectPermissionService.checkKanbanPermission(projectId, getAuthenticatedUser().getId(), KanbanPermissionType.ASSIGN_TASK);
        projectPermissionService.checkIsProjectMember(projectId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        task.setAssignee(user);

        return new TaskDTO(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getKanban().getProject() != null) {
            projectPermissionService.checkKanbanPermission(
                    task.getKanban().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    KanbanPermissionType.DELETE_TASK
            );
        }else if (!task.getKanban().isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the kanban creator");
        }

        taskRepository.delete(task);
    }

    private List<TaskDTO> convertToTasksListDTO(List<Task> tasks) {
        List<TaskDTO> dtos = new ArrayList<>();
        for (Task task : tasks) {
            dtos.add(new TaskDTO(task));
        }
        return dtos;
    }

    private User getAuthenticatedUser() {
        return userContextService.getAuthenticatedUser();
    }
}

