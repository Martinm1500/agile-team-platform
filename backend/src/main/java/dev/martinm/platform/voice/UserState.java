package dev.martinm.platform.voice;

import java.time.Instant;
import java.util.Map;

public record UserState(
        Instant heartbeat,
        boolean muted,
        boolean isReadyToProduce,
        String recvTransportId,
        Map<String, Object> rtpCapabilities,
        String producerId
) {

    public UserState {
        if (heartbeat == null) {
            heartbeat = Instant.now();
        }
    }

    public UserState() {
        this(Instant.now(), false, false, null, null, null);
    }

    public UserState updateHeartbeat() {
        return new UserState(Instant.now(), muted, isReadyToProduce, recvTransportId, rtpCapabilities, producerId);
    }

    public UserState updateMute(boolean muted) {
        return new UserState(heartbeat, muted, isReadyToProduce, recvTransportId, rtpCapabilities, producerId);
    }

    public UserState markReadyToProduce() {
        return new UserState(heartbeat, muted, true, recvTransportId, rtpCapabilities, producerId);
    }

    public UserState withRecvTransportId(String recvTransportId) {
        return new UserState(heartbeat, muted, isReadyToProduce, recvTransportId, rtpCapabilities, producerId);
    }

    public UserState withRtpCapabilities(Map<String, Object> rtpCapabilities) {
        return new UserState(heartbeat, muted, isReadyToProduce, recvTransportId, rtpCapabilities, producerId);
    }

    public UserState withProducerId(String producerId) {
        return new UserState(heartbeat, muted, isReadyToProduce, recvTransportId, rtpCapabilities, producerId);
    }

    public boolean isStale(long timeoutMillis) {
        long ageMillis = Instant.now().toEpochMilli() - heartbeat.toEpochMilli();
        return ageMillis > timeoutMillis;
    }
}