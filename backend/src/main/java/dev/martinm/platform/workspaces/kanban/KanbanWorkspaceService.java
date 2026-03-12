package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.projects.ProjectPermissionService;
import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.kanban.dto.ColumnDTO;
import dev.martinm.platform.workspaces.kanban.dto.KanbanWorkspaceDTO;
import dev.martinm.platform.workspaces.kanban.repository.KanbanWorkspaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class KanbanWorkspaceService {
    private final KanbanWorkspaceRepository kanbanWorkspaceRepository;
    private final ColumnService columnService;
    private final ProjectPermissionService projectPermissionService;
    private final UserContextService userContextService;

    // Consumed in ProjectService
    public KanbanWorkspaceDTO createWorkspace(Project project){
        User authenticatedUser = getAuthenticatedUser();

        projectPermissionService.checkIsProjectCreator(project.getId(), authenticatedUser);

        KanbanWorkspace savedWorkspace = kanbanWorkspaceRepository.save(new KanbanWorkspace(project));

        columnService.createDefaultColumns(savedWorkspace);

        return new KanbanWorkspaceDTO(savedWorkspace);
    }

    // standalone
    public KanbanWorkspaceDTO createWorkspace(String name) {

        KanbanWorkspace savedWorkspace = kanbanWorkspaceRepository.save(new KanbanWorkspace(name, getAuthenticatedUser()));

        List<ColumnDTO> columnDTOS = columnService.createDefaultColumns(savedWorkspace);

        return new KanbanWorkspaceDTO(savedWorkspace, columnDTOS);
    }

    // Consumed in ProjectService
    public KanbanWorkspaceDTO getWorkspaceByProjectId(Long projectId){
        KanbanWorkspace kanbanWorkspace = kanbanWorkspaceRepository.findByProjectId(projectId).orElseThrow(
                ()-> new RuntimeException("Kanbanworkspace Not found"));

        projectPermissionService.checkIsProjectMember(projectId, getAuthenticatedUser().getId());
        return new KanbanWorkspaceDTO(kanbanWorkspace);
    }

    public KanbanWorkspaceDTO getWorkspaceById(Long id) {
        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Kanban workspace not found"));

        if(workspace.getProject() != null){
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        } else if (!workspace.isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("Not owner exception");
        }

        List<ColumnDTO> columnDTOS = columnService.getColumns(id);

        return new KanbanWorkspaceDTO(workspace,columnDTOS);
    }

    public List<KanbanWorkspaceDTO> getAll(){
        List<KanbanWorkspace> kanbanWorkspaces = kanbanWorkspaceRepository.findAllByUser(getAuthenticatedUser());
        List<KanbanWorkspaceDTO> dtos = new ArrayList<>();
        for(KanbanWorkspace k : kanbanWorkspaces){
            List<ColumnDTO> colums = columnService.getColumns(k.getId());
            dtos.add(new KanbanWorkspaceDTO(k,colums));
        }
        return dtos;
    }

    public KanbanWorkspaceDTO updateWorkspace(Long id, KanbanWorkspaceDTO dto) {
        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Kanban workspace not found"));

        if(!workspace.isCreator(getAuthenticatedUser())){
            throw new RuntimeException("Only creator can update this workspace.");
        }

        workspace.setName(dto.getName());
        return new KanbanWorkspaceDTO(kanbanWorkspaceRepository.save(workspace));
    }

    public void deleteWorkspace(Long id) {
        KanbanWorkspace workspace = kanbanWorkspaceRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Kanban workspace not found"));

        if(workspace.isCreator(getAuthenticatedUser())) kanbanWorkspaceRepository.deleteById(id);
        else throw new RuntimeException("Only creator can dellet this workspace");

    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
