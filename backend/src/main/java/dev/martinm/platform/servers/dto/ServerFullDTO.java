package dev.martinm.platform.servers.dto;

import dev.martinm.platform.channels.ChannelDTO;
import dev.martinm.platform.projects.dto.ProjectFullDTO;
import dev.martinm.platform.roles.dto.RoleDTO;
import dev.martinm.platform.servers.Privacy;
import dev.martinm.platform.servers.Server;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
public class ServerFullDTO {
    private Long id;
    private String name;
    private String avatarUrl;
    private String bannerUrl;
    private String description;
    @Enumerated(EnumType.STRING)
    private Privacy privacy;
    Timestamp createdAt;

    private ServerOwnerDTO owner;
    private List<ChannelDTO> channels;
    private List<RoleDTO> roles;
    private List<ServerMemberDTO> members;
    private List<ProjectFullDTO> projects;

    public ServerFullDTO(Server server, ServerOwnerDTO owner, List<ChannelDTO> channelDTOS,
                                     List<RoleDTO> roleDTOS, List<ServerMemberDTO> serverMemberDTOS, List<ProjectFullDTO> projectFullDTOS){
        this.id = server.getId();
        this.name = server.getName();
        this.avatarUrl = server.getAvatarUrl();
        this.bannerUrl = server.getBannerUrl();
        this.description = server.getDescription();
        this.privacy = server.getPrivacy();
        this.createdAt = server.getCreatedAt();
        this.owner = owner;
        this.channels = channelDTOS;
        this.roles = roleDTOS;
        this.members = serverMemberDTOS;
        this.projects = projectFullDTOS;
    }
}
