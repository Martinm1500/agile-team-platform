package dev.martinm.platform.servers;

import dev.martinm.platform.servers.exceptions.NotMemberException;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.repository.ServerMemberRepository;
import dev.martinm.platform.exception.PermissionDeniedException;
import dev.martinm.platform.users.User;
import org.springframework.stereotype.Service;

@Service
public class ServerPermissionService {

    private final ServerMemberRepository serverMemberRepository;

    public ServerPermissionService(ServerMemberRepository serverMemberRepository) {
        this.serverMemberRepository = serverMemberRepository;
    }

    public void checkIsServerMember(Long serverId, User user) {
        getServerMember(serverId, user);
    }

    public void checkIsServerOwner(Long serverId, User user){
        ServerMember member = getServerMember(serverId, user);
        if(!user.equals(member.getServer().getOwner())){
            throw new RuntimeException();
        }
    }
    public boolean isServerOwner(Long serverId, User user){
        ServerMember member = getServerMember(serverId, user);

        return user.equals(member.getServer().getOwner());
    }

    public void checkServerPermission(Long serverId, PermissionType permissionType, User user) {
        ServerMember member = getServerMember(serverId, user);

        if (member.getRole() == null) {
            throw new IllegalStateException("Role or permissions not configured for server member");
        }

        boolean hasPerm = member.getRole().hasPermission(permissionType);

        if (!hasPerm) {
            throw new PermissionDeniedException("server", serverId, permissionType.getCode());
        }
    }

    private ServerMember getServerMember(Long serverId, User user) {
        ServerMemberKey key = new ServerMemberKey(serverId,user.getId());
        return serverMemberRepository.findById(key)
                .orElseThrow(() -> new NotMemberException("server", serverId));
    }
}