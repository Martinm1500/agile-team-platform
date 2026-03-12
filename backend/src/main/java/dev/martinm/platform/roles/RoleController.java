package dev.martinm.platform.roles;

import dev.martinm.platform.roles.dto.RoleDTO;
import dev.martinm.platform.roles.dto.RoleRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @GetMapping("/server/{serverId}")
    public ResponseEntity<List<RoleDTO>> getAllRolesForServer(@PathVariable Long serverId) {
        return ResponseEntity.ok(roleService.getAllRolesForServer(serverId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id, @RequestBody RoleRequestDTO dto) {
        return ResponseEntity.ok(roleService.updateRole(id, dto));
    }

}
