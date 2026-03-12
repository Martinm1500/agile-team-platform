package dev.martinm.platform.voice.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ReconnectionResponse {
    private boolean ok;
    private Map<String, Object> sendTransport;
    private Map<String, Object> recvTransport;
    private Map<String, Object> rtpCapabilities;
}
