package dev.martinm.platform.projects.controller;

import dev.martinm.platform.projects.ProjectMemberService;
import dev.martinm.platform.projects.dto.AcceptProjectInvitationResponse;
import dev.martinm.platform.projects.dto.ProjectInvitationDTO;
import dev.martinm.platform.projects.dto.ProjectInvitationRequest;
import dev.martinm.platform.projects.dto.ProjectMemberDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class ProjectMemberController {
    private final ProjectMemberService projectMemberService;

    public ProjectMemberController(ProjectMemberService projectMemberService) {
        this.projectMemberService = projectMemberService;
    }

    @PostMapping("/invitations")
    public ResponseEntity<ProjectInvitationDTO> sendInvitation(
            @PathVariable Long projectId,
            @RequestBody ProjectInvitationRequest request) {
        return ResponseEntity.ok(
                projectMemberService.sendProjectInvitation(projectId, request.getUserId())
        );
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<AcceptProjectInvitationResponse> acceptInvitationFromNotification(@PathVariable Long projectId,
                                                                                            @PathVariable Long invitationId){
        return ResponseEntity.ok(
           projectMemberService.acceptProjectInvitationFromNotification(projectId,invitationId)
        );
    }

    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitationFromNotification(@PathVariable Long invitationId){
        projectMemberService.rejectProjectInvitationFromNotification(invitationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProjectMemberDTO>> getMembersForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectMemberService.getMembersForProject(projectId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMemberFromProject(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        projectMemberService.removeMemberFromProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping()
    public ResponseEntity<ProjectMemberDTO> updateMemberSpecialty(@RequestBody ProjectMemberDTO dto) {
        System.out.println(dto);
        return ResponseEntity.ok(
                projectMemberService.updateMemberSpecialty(dto)
        );
    }
}
