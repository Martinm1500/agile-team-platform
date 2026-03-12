package dev.martinm.platform.servers;

import dev.martinm.platform.servers.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
public class ServerController {
    private final ServerService serverService;
    private final ServerMemberService serverMemberService;

    public ServerController(ServerService serverService, ServerMemberService serverMemberService) {
        this.serverService = serverService;
        this.serverMemberService = serverMemberService;
    }

    @PostMapping
    public ResponseEntity<ServerFullDTO> createServer(@RequestBody ServerDTO dto) {
        return ResponseEntity.ok(serverService.createServer(dto));
    }

    @GetMapping("/{serverId}")
    public ResponseEntity<ServerDTO> getServerById(@PathVariable Long serverId) {
        return ResponseEntity.ok(serverService.getServerById(serverId));
    }

    @GetMapping
    public ResponseEntity<List<ServerDTO>> getAllServers(){
        return ResponseEntity.ok(serverMemberService.getAllServers());
    }

    @GetMapping("/{serverId}/full")
    public ResponseEntity<ServerFullDTO> getServerFullById(@PathVariable Long serverId) {
        return ResponseEntity.ok(serverService.getServerFullById(serverId));
    }

    @PutMapping("/{serverId}")
    public ResponseEntity<ServerDTO> updateServer(@PathVariable Long serverId, @RequestBody ServerDTO dto) {
        return ResponseEntity.ok(serverService.updateServer(serverId, dto));
    }

    @DeleteMapping("/{serverId}")
    public ResponseEntity<Void> deleteServer(@PathVariable Long serverId) {
        serverService.deleteServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{serverId}/leave")
    public ResponseEntity<Void> leaveServer(@PathVariable Long serverId) {
        serverMemberService.leaveServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{serverId}/members")
    public ResponseEntity<List<ServerMemberDTO>> getMembers(@PathVariable Long serverId) {
        return ResponseEntity.ok(serverMemberService.getMembersByServerId(serverId));
    }

    @GetMapping("/{serverId}/members/{userId}")
    public ResponseEntity<ServerMember> getMember(@PathVariable Long serverId,
                                                  @PathVariable Long userId) {
        return ResponseEntity.ok(serverMemberService.getMember(serverId, userId));
    }

    @GetMapping("/{serverId}/is-member")
    public ResponseEntity<Boolean> isUserMember(@PathVariable Long serverId) {
        return ResponseEntity.ok(serverMemberService.isUserMember(serverId));
    }

    @PostMapping("/{serverId}/invitations")
    public ResponseEntity<ServerInvitationDTO> createInvitation(
            @PathVariable Long serverId,
            @RequestBody ServerInvitationRequest serverInvitation) {

        return ResponseEntity.ok(serverMemberService.sendServerInvitation(serverId,serverInvitation.getUserId()));
    }

    @PutMapping("/{serverId}/invitations/{invitationId}/accept")
    public ResponseEntity<AcceptInvitationResponse> acceptInvitationFromNotification(
            @PathVariable Long serverId,
            @PathVariable Long invitationId) {
        return ResponseEntity.ok(serverMemberService.acceptServerInvitation(serverId, invitationId));
    }

    @PostMapping("/{serverId}/invitations/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitationFromNotification(
            @PathVariable Long invitationId) {
        serverMemberService.rejectInvitation(invitationId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{serverId}/members/{userId}/kick")
    public ResponseEntity<Void> kickMember(@PathVariable Long serverId, @PathVariable Long userId) {
        serverMemberService.kickMember(serverId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{serverId}/members/{userId}/ban")
    public ResponseEntity<Void> banMember(@PathVariable Long serverId, @PathVariable Long userId) {
        serverMemberService.banMember(serverId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{serverId}/members")
    public ResponseEntity<ServerMemberDTO> updateMemberRole(@PathVariable Long serverId, @RequestBody ServerMemberDTO dto) {
        System.out.println(dto);
        return ResponseEntity.ok(serverMemberService.updateMemberRole(serverId, dto));
    }

    @GetMapping("/{serverId}/bans")
    public ResponseEntity<List<ServerBan>> getBans(@PathVariable Long serverId) {
        return ResponseEntity.ok(serverMemberService.getBansForServer(serverId));
    }

    @DeleteMapping("/{serverId}/bans/{userId}")
    public ResponseEntity<Void> unban(@PathVariable Long serverId, @PathVariable Long userId) {
        serverMemberService.unban(serverId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{serverId}/join-request")
    public ResponseEntity<Void> requestJoin(@PathVariable Long serverId){
        serverMemberService.requestToJoin(serverId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{serverId}/join-request/{requestId}/accept")
    public ResponseEntity<Void> acceptJoin(@PathVariable Long requestId){
        serverMemberService.acceptJoinRequest(requestId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{serverId}/join-request/{requestId}/reject")
    public ResponseEntity<Void> rejectJoin(@PathVariable Long requestId){
        serverMemberService.rejectJoinRequest(requestId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/join-request/all")
    public ResponseEntity<List<RequestToJoinDTO>> getRequestsOutgoing(){
        return ResponseEntity.ok(serverMemberService.outgoingRequestToJoin());
    }

    @PostMapping("/{serverId}/join")
    public ResponseEntity<Void> join(@PathVariable Long serverId){
        serverMemberService.joinServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/discover")
    public ResponseEntity<List<ServerDTO>> discover(){
        return ResponseEntity.ok(serverService.discover());
    }
}