package dev.martinm.platform.servers.dto;

import dev.martinm.platform.servers.Privacy;
import dev.martinm.platform.servers.Server;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class ServerDTO {
    private Long id;
    private String name;
    private String avatarUrl;
    private String bannerUrl;
    private String description;
    @Enumerated(EnumType.STRING)
    private Privacy privacy;
    private Long membersCount;

    public ServerDTO(Server server){
        this.id = server.getId();
        this.name = server.getName();
        this.avatarUrl = server.getAvatarUrl();
        this.bannerUrl = server.getBannerUrl();
        this.description = server.getDescription();
        this.privacy = server.getPrivacy();
    }

    public ServerDTO(Server server, Long membersCount){
        this.id = server.getId();
        this.name = server.getName();
        this.avatarUrl = server.getAvatarUrl();
        this.bannerUrl = server.getBannerUrl();
        this.description = server.getDescription();
        this.privacy = server.getPrivacy();
        this.membersCount = membersCount;
    }

    public ServerDTO(){}

}
