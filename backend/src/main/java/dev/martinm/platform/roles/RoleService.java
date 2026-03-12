package dev.martinm.platform.roles;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.roles.dto.RoleDTO;
import dev.martinm.platform.roles.dto.RoleRequestDTO;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.users.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final ServerPermissionService serverPermissionService;
    private final UserContextService userContextService;

    @Transactional
    public List<RoleDTO> createDefaultRoles(Server server) {
        Role adminRole = createRoleWithPermissions(
                server, DefaultRole.ADMIN, true, true, true, true, true, true
        );

        Role memberRole = createRoleWithPermissions(server, DefaultRole.MEMBER, false, false, false, true, false, false);
        Role guestRole = createRoleWithPermissions(server, DefaultRole.GUEST, false, false, false, false, false, false);

        return List.of(new RoleDTO(adminRole),
                new RoleDTO(memberRole), new RoleDTO(guestRole));
    }

    public Role getAdminRoleByServerId(Long serverId){
        return roleRepository.findByServerIdAndName(serverId,DefaultRole.ADMIN.getName()).orElseThrow(() -> new RuntimeException("Role not found"));
    }

    private Role createRoleWithPermissions(Server server, DefaultRole defaultRole,
                                           boolean manageChannels, boolean manageMembers,
                                           boolean manageRoles, boolean sendMessages,
                                           boolean manageServers, boolean manageProjects) {
        Role role = new Role();
        role.setServer(server);
        role.setName(defaultRole.getName());
        role.setDescription(defaultRole.getDescription());

        role.setManageChannels(manageChannels);
        role.setManageMembers(manageMembers);
        role.setManageRoles(manageRoles);
        role.setSendMessages(sendMessages);
        role.setManageServers(manageServers);
        role.setManageProject(manageProjects);

        return roleRepository.save(role);
    }

    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return new RoleDTO(role);
    }

    public List<RoleDTO> getAllRolesForServer(Long serverId) {
        List<Role> roles = roleRepository.findByServerId(serverId);
        List<RoleDTO> roleDTOS = new ArrayList<>();

        for(Role role : roles){
            roleDTOS.add(new RoleDTO(role));
        }

        return roleDTOS;
    }

    @Transactional
    public RoleDTO updateRole(Long id, RoleRequestDTO dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        serverPermissionService.checkServerPermission(role.getServer().getId(), PermissionType.MANAGE_ROLES, getAuthenticatedUser());

        role.setName(dto.getName());
        role.setDescription(dto.getDescription());

        role.setManageChannels(dto.isManageChannels());
        role.setManageMembers(dto.isManageMembers());
        role.setManageRoles(dto.isManageRoles());
        role.setSendMessages(dto.isSendMessages());
        role.setManageServers(dto.isManageServers());

        return new RoleDTO(roleRepository.save(role));
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
