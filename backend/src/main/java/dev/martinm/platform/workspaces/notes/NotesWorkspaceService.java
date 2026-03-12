package dev.martinm.platform.workspaces.notes;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.projects.ProjectPermissionService;
import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.notes.dto.NotesWorkspaceDTO;
import dev.martinm.platform.workspaces.notes.repository.NotesWorkspaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class NotesWorkspaceService {
    private final NotesWorkspaceRepository notesWorkspaceRepository;
    private final ProjectPermissionService projectPermissionService;
    private final UserContextService userContextService;

    // Standalone
    public NotesWorkspaceDTO createWorkspace(NotesWorkspaceDTO dto) {
       NotesWorkspace workspace = new NotesWorkspace(getAuthenticatedUser(), dto.getName());
       NotesWorkspace savedWorkspace = notesWorkspaceRepository.save(workspace);
        return new NotesWorkspaceDTO(savedWorkspace);
    }

    // Consumed in ProjectService
    public NotesWorkspaceDTO creteWorkspace(Project project){

        projectPermissionService.checkIsProjectCreator(project.getId(), getAuthenticatedUser());

        NotesWorkspace savedWorkspace = notesWorkspaceRepository.save(new NotesWorkspace(project));

        return new NotesWorkspaceDTO(savedWorkspace);
    }

    public NotesWorkspaceDTO getWorkspaceById(Long id) {
        NotesWorkspace workspace = notesWorkspaceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Notes workspace not found"));

        if(workspace.getProject() != null){
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        }else if (!workspace.isCreator(getAuthenticatedUser())) {
                throw new RuntimeException("User is not the workspace creator");
        }

        return new NotesWorkspaceDTO(workspace);
    }

    // Consumed in ProjectService
    public NotesWorkspaceDTO getWorkspaceByProjectId(Long projectId){
        NotesWorkspace notesWorkspace = notesWorkspaceRepository.findByProjectId(projectId).orElseThrow(
                () -> new RuntimeException("Notesworkspace Not found"));

        return new NotesWorkspaceDTO(notesWorkspace);
    }

    public NotesWorkspaceDTO updateWorkspace(Long id, NotesWorkspaceDTO dto) {
        NotesWorkspace workspace = notesWorkspaceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Notes workspace not found"));

        if (!workspace.isCreator(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the workspace creator");
        }

        workspace.setName(dto.getName());

        NotesWorkspace savedWorspace = notesWorkspaceRepository.save(workspace);

        return new NotesWorkspaceDTO(savedWorspace);
    }

    public void deleteWorkspace(Long id) {
        NotesWorkspace workspace = notesWorkspaceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Notes workspace not found"));

        if (workspace.isCreator(getAuthenticatedUser())) {
            notesWorkspaceRepository.deleteById(id);
        }else {
            throw new RuntimeException("User is not the workspace creator");
        }
    }

    public List<NotesWorkspaceDTO> getAllWorkspaces(){
        List<NotesWorkspaceDTO> workspaceDTOS = new ArrayList<>();

        List<NotesWorkspace> workspaces = notesWorkspaceRepository.findAllByUserIsCreatorOrProjectMember(getAuthenticatedUser());

        for(NotesWorkspace workspace : workspaces){
            workspaceDTOS.add(new NotesWorkspaceDTO(workspace));
        }

        return workspaceDTOS;
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
