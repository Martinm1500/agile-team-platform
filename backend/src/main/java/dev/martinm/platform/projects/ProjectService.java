package dev.martinm.platform.projects;

import dev.martinm.platform.channels.ChannelDTO;
import dev.martinm.platform.channels.ChannelService;
import dev.martinm.platform.projects.dto.*;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.servers.repository.ServerRepository;
import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.servers.exceptions.ServerNotFoundException;
import dev.martinm.platform.users.User;
import dev.martinm.platform.projects.repository.ProjectRepository;
import dev.martinm.platform.workspaces.kanban.KanbanWorkspaceService;
import dev.martinm.platform.workspaces.kanban.dto.KanbanWorkspaceDTO;
import dev.martinm.platform.workspaces.notes.dto.NotesWorkspaceDTO;
import dev.martinm.platform.workspaces.notes.NotesWorkspaceService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectPermissionService projectPermissionService;
    private final ServerRepository serverRepository;
    private final ServerPermissionService serverPermissionService;
    private final SpecialtyService specialtyService;
    private final ChannelService channelService;
    private final ProjectMemberService projectMemberService;
    private final KanbanWorkspaceService kanbanWorkspaceService;
    private final NotesWorkspaceService notesWorkspaceService;
    private final UserContextService userContextService;

    @Transactional
    public ProjectFullDTO createProject(ProjectDTO dto) {

        Long serverId = dto.getServerId();
        String projectName = dto.getName();

        if(projectName == null) throw new RuntimeException("ProjectName cannot be null");
        if (serverId == null) throw new RuntimeException("ServerId cannot be null");

        User authenticatedUser = getAuthenticatedUser();

        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_PROJECTS, authenticatedUser);

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        Project project = new Project(server, projectName, authenticatedUser, dto.isHasKanban(), dto.isHasNotes());
        Project savedProject = projectRepository.save(project);

        // Crear canales de texto y vos por defecto
        List<ChannelDTO> channelDTOS = channelService.createDefaultChannelsForProject(savedProject, server);

        // Crear espacios de trabajo por defecto
        KanbanWorkspaceDTO kanbanWorkspaceDTO = null;
        NotesWorkspaceDTO notesWorkspaceDTO = null;

        if(dto.isHasKanban()){
            kanbanWorkspaceDTO = kanbanWorkspaceService.createWorkspace(savedProject);
        }

        if(dto.isHasNotes()){
            notesWorkspaceDTO = notesWorkspaceService.creteWorkspace(savedProject);
        }

        // Crear especialidades por defecto primero
        List<SpecialtyDTO> specialtyDTOS = specialtyService.createDefaultSpecialties(savedProject);

        // Luego obtener el Project Lead Specialty
        Specialty projectLeadSpecialty = specialtyService.getProjectLeadSpecialtyByProjectId(savedProject.getId());

        // Crear miembro principal (Project Lead)
        ProjectMemberDTO projectMemberDTO =
                projectMemberService.createProjectMember(savedProject, authenticatedUser, projectLeadSpecialty);

        List<ProjectMemberDTO> projectMemberDTOS = List.of(projectMemberDTO);

        return new ProjectFullDTO(savedProject, authenticatedUser, projectMemberDTOS, specialtyDTOS, channelDTOS, kanbanWorkspaceDTO, notesWorkspaceDTO);
    }

    public Project getProjectById(Long id) {
        projectPermissionService.checkIsProjectMember(id, getAuthenticatedUser().getId());

        return projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public List<ProjectFullDTO> getAllProjectsForServer(Long serverId) {

        serverPermissionService.checkIsServerMember(serverId,getAuthenticatedUser());

        // IMPORTANTE , Devuelve solo los proyectos donde es miembro
        List<Project> projects = projectMemberService.getProjectsByUserId(getAuthenticatedUser().getId(), serverId);

        List<ProjectFullDTO> projectFullDTOS = new ArrayList<>();

        for(Project project : projects){

            Long projectId = project.getId();

            List<ProjectMemberDTO> projectMemberDTOS = projectMemberService.getMembersForProject(projectId);
            List<SpecialtyDTO> specialtyDTOS = specialtyService.getSpecialtiesByProjectId(projectId);
            List<ChannelDTO> channelDTOS = channelService.getChannelsForProject(projectId);

            // Crear espacios de trabajo por defecto
            KanbanWorkspaceDTO kanbanWorkspaceDTO = null;
            NotesWorkspaceDTO notesWorkspaceDTO = null;

            if(project.isHasKanban()){
                kanbanWorkspaceDTO = kanbanWorkspaceService.getWorkspaceByProjectId(projectId);
            }

            if(project.isHasNotes()){
                notesWorkspaceDTO =  notesWorkspaceService.getWorkspaceByProjectId(projectId);
            }

            ProjectFullDTO projectFullDTO = new ProjectFullDTO(project, project.getCreator() ,projectMemberDTOS
                    , specialtyDTOS,channelDTOS, kanbanWorkspaceDTO, notesWorkspaceDTO);

            projectFullDTOS.add(projectFullDTO);
        }

        return projectFullDTOS;
    }

    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        projectPermissionService.checkIsProjectCreator(id, getAuthenticatedUser());

        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));

        project.setName(dto.getName());
        return new ProjectDTO(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        projectPermissionService.checkIsProjectCreator(id, getAuthenticatedUser());
        projectRepository.deleteById(id);
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
