package dev.martinm.platform.servers;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class ServerMemberKey implements Serializable {
    private Long serverId;
    private Long userId;

    public ServerMemberKey(Long serverId, Long userId) {
        this.serverId = serverId;
        this.userId = userId;
    }

    public ServerMemberKey(){}
}
