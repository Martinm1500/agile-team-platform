package dev.martinm.platform.channels;

import lombok.Data;

@Data
public class ChannelDTO {
    private Long id;
    private Long serverId;
    private Long projectId;
    private String name;
    private ChannelType type;

    public ChannelDTO(Channel channel){
        this.id = channel.getId();
        this.serverId = channel.getServer().getId();
        if(channel.getProject() != null){
            this.projectId = channel.getProject().getId();
        }
        this.name = channel.getName();
        this.type = channel.getType();
    }

    public ChannelDTO(){}
}
