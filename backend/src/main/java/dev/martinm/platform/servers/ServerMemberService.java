package dev.martinm.platform.servers;

import dev.martinm.platform.notifications.Notification;
import dev.martinm.platform.notifications.NotificationRepository;
import dev.martinm.platform.notifications.NotificationService;
import dev.martinm.platform.notifications.NotificationType;
import dev.martinm.platform.projects.repository.ProjectMemberRepository;
import dev.martinm.platform.roles.*;
import dev.martinm.platform.servers.dto.*;
import dev.martinm.platform.servers.exceptions.*;
import dev.martinm.platform.servers.repository.*;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import dev.martinm.platform.auth.UserContextService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ServerMemberService {
    private final ServerMemberRepository serverMemberRepository;
    private final ServerRepository serverRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final ServerPermissionService serverPermissionService;
    private final UserContextService userContextService;
    private final ServerBanRepository serverBanRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ServerInvitationRepository serverInvitationRepository;
    private final RequestToJoinRepository requestToJoinRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    @Transactional
    public ServerInvitationDTO sendServerInvitation(Long serverId, Long userId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());

        User invitedUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        validateUserCanBeInvited(serverId, userId);

        Optional<RequestToJoin> requestToJoin = requestToJoinRepository.findByServerIdAndRequesterId(server.getId(), invitedUser.getId());
        requestToJoin.ifPresent(requestToJoinRepository::delete);

        ServerInvitation savedInvitation = serverInvitationRepository.save(
                new ServerInvitation(server,invitedUser,getAuthenticatedUser()));

        notificationService.sendServerInvitationNotification(savedInvitation);

        return new ServerInvitationDTO(savedInvitation);
    }

    @Transactional
    public AcceptInvitationResponse acceptServerInvitation(Long serverId, Long invitationId) {
        ServerInvitation invitation = serverInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new InvitationNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("This invitation is not for you");
        }

        if (invitation.isRejected()) {
            throw new RuntimeException("Invitation already rejected");
        }

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        if (invitation.isAccepted()) {
            return new AcceptInvitationResponse(server.getId());
        }

        validateUserCanJoinServer(serverId, getAuthenticatedUser().getId());

        createMember(server, getAuthenticatedUser());

        notificationService.readInvitationNotification(getAuthenticatedUser().getId(),invitationId, "accepted");

        notificationService.informInvitationAccepted(invitation.getCreatedBy(),
                invitation.getInvitedUser().getUsername(), invitation.getId(), serverId, null, NotificationType.SERVER_INVITATION_ACCEPTED);

        serverInvitationRepository.delete(invitation);

        return new AcceptInvitationResponse(server.getId());
    }

    @Transactional
    public void rejectInvitation(Long invitationId) {
        ServerInvitation invitation = serverInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new InvitationNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("This invitation is not for you");
        }

        if (invitation.isAccepted() || invitation.isRejected()) {
            return;
        }

        serverInvitationRepository.delete(invitation);

        notificationService.readInvitationNotification(getAuthenticatedUser().getId(),invitationId, "rejected");
    }

    public void requestToJoin(Long serverId){
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        if(server.isPrivate() || server.isPublic()) throw new RuntimeException("Server isn't Default");

        validateUserCanJoinServer(serverId, getAuthenticatedUser().getId());

        RequestToJoin savedRequest = requestToJoinRepository.save(new RequestToJoin(server, getAuthenticatedUser()));

        notificationService.sendRequestToJoinNotification(savedRequest);
    }

    public void acceptJoinRequest(Long requestId){
        RequestToJoin request = requestToJoinRepository.findById(requestId).orElseThrow(
                () -> new RuntimeException("RequestToJoin not found."));

        if (request.isRejected()) {
            throw new RuntimeException("Request already rejected");
        }

        if (request.isAccepted()) {
            throw new RuntimeException("Request already accepted");
        }

        if(!request.getServer().getOwner().getId().equals(getAuthenticatedUser().getId())){
            throw new RuntimeException("It's not owner");
        }

        Server server = serverRepository.findById(request.getServer().getId())
                .orElseThrow(() -> new ServerNotFoundException("Server not found", request.getServer().getId()));

        validateUserCanJoinServer(server.getId(), request.getRequester().getId());

        createMember(server, request.getRequester());

        notificationService.informRequestToJoinAccepted(request);

        requestToJoinRepository.delete(request);
    }

    public void rejectJoinRequest(Long requestId){
        RequestToJoin request = requestToJoinRepository.findById(requestId).orElseThrow(
                () -> new RuntimeException("RequestToJoin not found."));

        if(!request.getServer().getOwner().getId().equals(getAuthenticatedUser().getId())){
            throw new RuntimeException("It's not owner");
        }
        request.reject();
        requestToJoinRepository.save(request);
    }

    public List<RequestToJoinDTO> outgoingRequestToJoin(){
        List<RequestToJoin> requests = requestToJoinRepository.findAllByRequesterId(getAuthenticatedUser().getId());
        List<RequestToJoinDTO> dtos = new ArrayList<>();
        for(RequestToJoin r: requests){
            dtos.add(new RequestToJoinDTO(r));
        }
        return dtos;
    }

    public void joinServer(Long serverId){
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ServerNotFoundException("Server not found", serverId));

        if(server.isPrivate() || server.isDefault()){
            throw new RuntimeException("Server isn't PUBLIC");
        }

        validateUserCanJoinServer(serverId, getAuthenticatedUser().getId());

        createMember(server, getAuthenticatedUser());

        Optional<ServerInvitation> invitation = serverInvitationRepository.findByServerIdAndInvitedUserId(serverId, getAuthenticatedUser().getId());
        invitation.ifPresent(serverInvitationRepository::delete);

        List<Notification> notifications = notificationRepository.findByUserIdAndRelatedServerId(getAuthenticatedUser().getId(), serverId);
        for(Notification n : notifications){
            if(n.getType() == NotificationType.SERVER_INVITATION){
                notificationRepository.delete(n);
            }
        }
    }

    private void validateUserCanBeInvited(Long serverId, Long userId) {
        validateUserNotBanned(serverId, userId);
        validateUserNotMember(serverId, userId);
    }

    private void validateUserCanJoinServer(Long serverId, Long userId) {
        validateUserNotMember(serverId, userId);
        validateUserNotBanned(serverId, userId);
    }

    private void validateUserNotBanned(Long serverId, Long userId) {
        Optional<ServerBan> optionalBan = serverBanRepository.findByServerIdAndUserId(serverId, userId);

        if (optionalBan.isPresent()) {
            throw new UserBannedException("User is banned from this server");
        }
    }

    private void validateUserNotMember(Long serverId, Long userId) {
        ServerMemberKey key = new ServerMemberKey(serverId, userId);
        if (serverMemberRepository.existsById(key)) {
            throw new UserAlreadyMemberException("User already member");
        }
    }

    public boolean isUserMember(Long serverId) {
        try {
            serverPermissionService.checkIsServerMember(serverId, getAuthenticatedUser());
            return true;
        } catch (NotMemberException e) {
            return false;
        }
    }

    @Transactional
    public void removeMemberFromServer(Long serverId, Long userId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());
        validateMemberExists(serverId, userId);

        ServerMemberKey key = new ServerMemberKey(serverId, userId);
        serverMemberRepository.deleteById(key);
    }

    @Transactional
    public ServerMemberDTO updateMemberRole(Long serverId, ServerMemberDTO dto) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_ROLES, getAuthenticatedUser());

        ServerMember member = getMember(serverId, dto.getUserId());

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (!role.getServer().getId().equals(serverId)) {
            throw new RuntimeException("Role does not belong to this server");
        }
        member.setRole(role);
        return new ServerMemberDTO(serverMemberRepository.save(member));
    }

    @Transactional
    public void leaveServer(Long serverId) {
        serverPermissionService.checkIsServerMember(serverId, getAuthenticatedUser());

        if(serverPermissionService.isServerOwner(serverId,getAuthenticatedUser())){
            throw new RuntimeException("User cannot leave the server when is owner");
        }
        ServerMemberKey key = new ServerMemberKey(serverId, getAuthenticatedUser().getId());
        serverMemberRepository.deleteById(key);
    }

    @Transactional
    public void kickMember(Long serverId, Long userId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());
        validateMemberExists(serverId, userId);
        notificationService.sendMemberRemovedNotification(serverId, userId);
        projectMemberRepository.deleteByUserIdAndServerId(userId, serverId);
        removeMemberFromServer(serverId, userId);
    }

    @Transactional
    public void banMember(Long serverId, Long userId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());
        validateMemberExists(serverId, userId);
        removeMemberFromServer(serverId, userId);
        ServerBan ban = new ServerBan();
        ban.setServerId(serverId);
        ban.setUserId(userId);
        serverBanRepository.save(ban);
    }

    public List<ServerBan> getBansForServer(Long serverId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());
        return serverBanRepository.findByServerId(serverId);
    }

    @Transactional
    public void unban(Long serverId, Long userId) {
        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_MEMBERS, getAuthenticatedUser());

        Optional<ServerBan> optionalBan = serverBanRepository.findByServerIdAndUserId(serverId, userId);
        if (optionalBan.isPresent()) {
            serverBanRepository.delete(optionalBan.get());
        } else {
            throw new RuntimeException("User is not banned from this server");
        }
    }

    public void validateMemberExists(Long serverId, Long userId) {
        ServerMemberKey key = new ServerMemberKey(serverId, userId);
        if (!serverMemberRepository.existsById(key)) {
            throw new RuntimeException("Member not found");
        }
    }

    private void createMember(Server server, User user) {
        ServerMemberKey key = new ServerMemberKey(server.getId(), user.getId());

        Role role = roleRepository.findByServerIdAndName(server.getId(), DefaultRole.MEMBER.getName())
                .orElseThrow(() -> new InvitationNotFoundException("Role not found"));

        serverMemberRepository.save(new ServerMember(key, server,user,role));
    }

    public void createOwner(Server server, User user){
        Role adminRole = roleService.getAdminRoleByServerId(server.getId());
        ServerMemberKey key = new ServerMemberKey(server.getId(), user.getId());
        serverMemberRepository.save(new ServerMember(key, server,user,adminRole));
    }

    public ServerMember getMember(Long serverId, Long userId) {
        serverPermissionService.checkIsServerMember(serverId, getAuthenticatedUser());
        ServerMemberKey key = new ServerMemberKey(serverId, userId);
        return serverMemberRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public List<ServerMemberDTO> getMembersByServerId(Long serverId){
        List<ServerMember> serverMembers = serverMemberRepository.findByServerId(serverId);
        List<ServerMemberDTO> serverMemberDTOS = new ArrayList<>();

        for(ServerMember member : serverMembers){
            serverMemberDTOS.add(new ServerMemberDTO(member));
        }

        return serverMemberDTOS;
    }

    public List<ServerDTO> getAllServers(){
        List<Server> servers = serverMemberRepository.findServersByUserId(getAuthenticatedUser().getId());
        List<ServerDTO> serverDTOS = new ArrayList<>();

        for(Server server : servers){
            serverDTOS.add(new ServerDTO(server));
        }
        return serverDTOS;
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }

}