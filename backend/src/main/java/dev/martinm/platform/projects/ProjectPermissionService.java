package dev.martinm.platform.projects;

import dev.martinm.platform.projects.repository.ProjectMemberRepository;
import dev.martinm.platform.projects.repository.ProjectRepository;
import dev.martinm.platform.projects.types.KanbanPermissionType;
import dev.martinm.platform.exception.PermissionDeniedException;
import dev.martinm.platform.projects.types.NotesPermissionType;
import dev.martinm.platform.servers.exceptions.NotMemberException;
import dev.martinm.platform.users.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ProjectPermissionService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;

    public void checkIsProjectCreator(Long projectId, User user){
        if(!user.equals(getProjectCreator(projectId))){
            throw new RuntimeException();
        }
    }

    private User getProjectCreator(Long projectId){
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        return project.getCreator();
    }

    public void checkIsProjectMember(Long projectId, Long userId) {
        ProjectMemberKey key = new ProjectMemberKey(projectId, userId);

        if(!projectMemberRepository.existsById(key)){
            throw new NotMemberException("Not project member, user with id: ",userId);
        }
    }

    public void checkKanbanPermission(Long projectId, Long userId, KanbanPermissionType permissionType){
        ProjectMember member = getProjectMember(projectId, userId);

        if(member.getSpecialty() == null || member.getSpecialty().getKanbanPermission() == null){
           throw new IllegalStateException("Spacialty or KanbanPermission not configured for project member");
        }

        boolean hasPerm = member.getSpecialty().getKanbanPermission().hasPermission(permissionType);

        if(!hasPerm){
            throw new PermissionDeniedException("Project", projectId, permissionType.name());
        }
    }

    public void checkNotesPermission(Long projectId, Long userId, NotesPermissionType permissionType){
        ProjectMember member = getProjectMember(projectId, userId);

        if(member.getSpecialty() == null || member.getSpecialty().getNotesPermission() == null){
            throw new IllegalStateException("Spacialty or NotesPermission not configured for project member");
        }

        boolean hasPerm = member.getSpecialty().getNotesPermission().hasPermission(permissionType);

        if(!hasPerm){
            throw new PermissionDeniedException("Project", projectId, permissionType.name());
        }
    }

    private ProjectMember getProjectMember(Long projectId, Long userId){
        ProjectMemberKey key = new ProjectMemberKey(projectId,userId);
        return projectMemberRepository.findById(key).orElseThrow(() -> new RuntimeException("Not member Exception"));
    }
}
