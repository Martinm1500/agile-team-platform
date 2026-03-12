package dev.martinm.platform.servers;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.channels.ChannelDTO;
import dev.martinm.platform.channels.ChannelService;
import dev.martinm.platform.projects.ProjectService;
import dev.martinm.platform.projects.dto.ProjectDTO;
import dev.martinm.platform.projects.dto.ProjectFullDTO;
import dev.martinm.platform.servers.dto.*;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.roles.dto.RoleDTO;
import dev.martinm.platform.roles.RoleService;
import dev.martinm.platform.servers.exceptions.ServerNotFoundException;
import dev.martinm.platform.servers.repository.ServerRepository;
import dev.martinm.platform.users.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ServerService {
    private final ServerRepository serverRepository;
    private final ServerMemberService serverMemberService;
    private final ServerPermissionService serverPermissionService;
    private final RoleService roleService;
    private final ProjectService projectService;
    private final ChannelService channelService;
    private final UserContextService userContextService;

    public ServerFullDTO createServer(ServerDTO serverDto) {

        Server server = new Server(serverDto.getName(), getAuthenticatedUser());
        Server savedServer = serverRepository.save(server);

        List<ChannelDTO> channelDTOS = channelService.createDefaultChannelsForServer(savedServer);
        List<RoleDTO> roleDTOS = roleService.createDefaultRoles(savedServer);

        ServerOwnerDTO owner = createOwnerMember(savedServer, getAuthenticatedUser());

        List<ServerMemberDTO> serverMemberDTOS = serverMemberService.getMembersByServerId(savedServer.getId());

        ProjectFullDTO projectFullDTO = projectService.createProject(
                new ProjectDTO(server.getId(),"starter", true, true));

        return new ServerFullDTO(savedServer, owner,channelDTOS,roleDTOS,serverMemberDTOS, List.of(projectFullDTO));
    }

    public ServerFullDTO getServerFullById(Long serverId){

        serverPermissionService.checkIsServerMember(serverId,getAuthenticatedUser());

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server", serverId));

        List<ChannelDTO> channelDTOS = channelService.getChannelsForServer(serverId);
        List<RoleDTO> roleDTOS = roleService.getAllRolesForServer(serverId);
        List<ServerMemberDTO> serverMemberDTOS = serverMemberService.getMembersByServerId(serverId);
        List<ProjectFullDTO> projectFullDTOS = projectService.getAllProjectsForServer(serverId);


        return new ServerFullDTO(server,new ServerOwnerDTO(server.getOwner()),channelDTOS,roleDTOS,serverMemberDTOS, projectFullDTOS);
    }

    private ServerOwnerDTO createOwnerMember(Server server, User user) {
        serverMemberService.createOwner(server,user);
        return new ServerOwnerDTO(user);
    }

    public ServerDTO getServerById(Long serverId) {

        serverPermissionService.checkIsServerMember(serverId,getAuthenticatedUser());

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server", serverId));
        return new ServerDTO(server);
    }

    public ServerDTO updateServer(Long serverId, ServerDTO dto) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server", serverId));

        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_SERVERS, getAuthenticatedUser());

        server.setName(dto.getName());
        server.setAvatarUrl(dto.getAvatarUrl());
        server.setBannerUrl(dto.getBannerUrl());
        server.setDescription(dto.getDescription());
        server.setPrivacy(dto.getPrivacy());

        Server savedServer = serverRepository.save(server);

        return new ServerDTO(savedServer);
    }

    public void deleteServer(Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server", serverId));

        serverPermissionService.checkIsServerOwner(serverId,getAuthenticatedUser());
        serverRepository.delete(server);
    }

    public List<ServerDTO> discover(){
        List<Server> servers = serverRepository.findAllNonPrivateServers();
        List<ServerDTO> dtos = new ArrayList<>();
        for(Server s: servers){
            Long count = serverRepository.countMembersByServerId(s.getId());
            dtos.add(new ServerDTO(s,count));
        }
        return dtos;
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}