package dev.martinm.platform.voice;

import java.time.Instant;

public record UserChannelState(Long channelId, Long serverId, Instant lastHeartbeat, long version) {

    public UserChannelState {
        if (version < 1) {
            throw new IllegalArgumentException("Version must be >= 1: " + version);
        }
        if (lastHeartbeat == null) {
            lastHeartbeat = Instant.now();
        }
    }

    public UserChannelState(Long channelId, Long serverId) {
        this(channelId, serverId, Instant.now(), 1L);
    }


    public UserChannelState updateHeartbeat() {
        return new UserChannelState(channelId, serverId, Instant.now(), version + 1);
    }

    public boolean isStale(long timeoutMillis) {
        long ageMillis = Instant.now().toEpochMilli() - lastHeartbeat.toEpochMilli();
        return ageMillis > timeoutMillis;
    }
}