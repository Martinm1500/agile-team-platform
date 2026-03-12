package dev.martinm.platform.projects;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.notifications.NotificationService;
import dev.martinm.platform.notifications.NotificationType;
import dev.martinm.platform.projects.dto.AcceptProjectInvitationResponse;
import dev.martinm.platform.projects.dto.ProjectInvitationDTO;
import dev.martinm.platform.projects.dto.ProjectMemberDTO;
import dev.martinm.platform.projects.repository.ProjectInvitationRepository;
import dev.martinm.platform.projects.repository.ProjectMemberRepository;
import dev.martinm.platform.projects.repository.ProjectRepository;
import dev.martinm.platform.projects.repository.SpecialtyRepository;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.ServerMemberService;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.servers.exceptions.ServerNotFoundException;
import dev.martinm.platform.servers.exceptions.UserNotFoundException;
import dev.martinm.platform.servers.repository.ServerRepository;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectInvitationRepository projectInvitationRepository;
    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyService specialtyService;
    private final UserRepository userRepository;
    private final ServerMemberService serverMemberService;
    private final ServerRepository serverRepository;
    private final ServerPermissionService serverPermissionService;
    private final ServerPermissionService permissionService;
    private final UserContextService userContextService;
    private final NotificationService notificationService;

    public ProjectMemberDTO createProjectMember(Project project, User user, Specialty specialty){

        ProjectMemberKey key = new ProjectMemberKey(project.getId(), user.getId());

        ProjectMember projectMember = new ProjectMember(key,project,user,specialty);

        ProjectMember savedProjectMember = projectMemberRepository.save(projectMember);

        return new ProjectMemberDTO(savedProjectMember);
    }

    @Transactional
    public ProjectInvitationDTO sendProjectInvitation(Long projectId, Long userId){

        User invitedUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found."));

        Long serverId = project.getServer().getId();

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_PROJECTS, getAuthenticatedUser());

        serverMemberService.validateMemberExists(serverId,userId);

        ProjectInvitation projectInvitation = new ProjectInvitation();
        projectInvitation.setServer(server);
        projectInvitation.setProject(project);
        projectInvitation.setCreatedBy(getAuthenticatedUser());
        projectInvitation.setInvitedUser(invitedUser);

        ProjectInvitation savedProjectInvitation = projectInvitationRepository.save(projectInvitation);

        notificationService.sendProjectInvitationNotification(savedProjectInvitation);

        return new ProjectInvitationDTO(savedProjectInvitation);
    }

    public AcceptProjectInvitationResponse acceptProjectInvitationFromNotification(Long projectId, Long invitationId){
        User authenticatedUser = userContextService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId).orElseThrow(()-> new RuntimeException("Project not found"));

        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId).orElseThrow(()->new RuntimeException("Project not found"));

        if(!invitation.getInvitedUser().getId().equals(authenticatedUser.getId())){
            throw new RuntimeException("This invitation is not for current user");
        }

        if (invitation.isRejected()) {
            throw new RuntimeException("Invitation already rejected");
        }

        if (invitation.isAccepted()) {
            return new AcceptProjectInvitationResponse(projectId);
        }

        serverMemberService.validateMemberExists(project.getServer().getId(),authenticatedUser.getId());

        createProjectMemberAsContributor(project,authenticatedUser);

        invitation.accept();
        projectInvitationRepository.save(invitation);

        notificationService.readInvitationNotification(authenticatedUser.getId(), invitationId, "accepted");
        notificationService.informInvitationAccepted(invitation.getCreatedBy(),
                invitation.getInvitedUser().getUsername(), invitationId,project.getServer().getId(), projectId, NotificationType.PROJECT_INVITATION_ACCEPTED);

        return new AcceptProjectInvitationResponse(projectId);
    }

    private void createProjectMemberAsContributor(Project project, User user){
        Specialty contributor = specialtyService.getContributorSpecialtyByProjectId(project.getId());

        ProjectMemberKey key = new ProjectMemberKey(project.getId(),user.getId());

        ProjectMember projectMember = new ProjectMember(key,project,user,contributor);

        projectMemberRepository.save(projectMember);
    }

    public void rejectProjectInvitationFromNotification(Long invitationId){
        User authenticatedUser = userContextService.getAuthenticatedUser();

        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId).orElseThrow(()->new RuntimeException("Project not found"));

        if(!invitation.getInvitedUser().getId().equals(authenticatedUser.getId())){
            throw new RuntimeException("This invitation is not for current user");
        }

        if (invitation.isRejected()) {
            throw new RuntimeException("Invitation already rejected");
        }

        if (invitation.isAccepted()) {
            throw new RuntimeException("Invitation is already rejected");
        }

        invitation.accept();
        projectInvitationRepository.save(invitation);

        notificationService.readInvitationNotification(authenticatedUser.getId(), invitationId, "rejected");
    }

    public List<ProjectMemberDTO> getMembersForProject(Long projectId) {
        List<ProjectMemberDTO> projectMemberDTOS = new ArrayList<>();
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);

        for(ProjectMember projectMember: projectMembers){
            projectMemberDTOS.add(new ProjectMemberDTO(projectMember));
        }
        return projectMemberDTOS;
    }

    public List<Project> getProjectsByUserId(Long userId, Long serverId){
        return projectMemberRepository.findProjectsByUserIdAndServerId(userId, serverId);
    }

    public void removeMemberFromProject(Long projectId, Long userId) {
        Long serverId = projectRepository.findById(projectId).orElseThrow().getServer().getId();
        permissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());
        ProjectMemberKey key = new ProjectMemberKey(projectId,userId);
        notificationService.sendProjectMemberRemovedNotification(serverId,projectId,userId);
        projectMemberRepository.deleteById(key);
    }

    public ProjectMemberDTO updateMemberSpecialty(ProjectMemberDTO dto) {
        Long serverId = projectRepository.findById(dto.getProjectId()).orElseThrow().getServer().getId();
        permissionService.checkServerPermission(serverId, PermissionType.MANAGE_ROLES, getAuthenticatedUser());
        ProjectMemberKey key = new ProjectMemberKey(dto.getProjectId(),dto.getUserId());
        ProjectMember member = projectMemberRepository.findById(key).orElseThrow(
                () -> new RuntimeException("Member not found"));
        System.out.println(member);
        Specialty specialty = specialtyRepository.findById(dto.getSpecialtyId()).orElseThrow(
                () -> new RuntimeException("Specialty not found")
        );
        member.setSpecialty(specialty);

        ProjectMember savedProjectMember = projectMemberRepository.save(member);
        System.out.println(savedProjectMember);

        return new ProjectMemberDTO(savedProjectMember);
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
