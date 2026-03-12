package dev.martinm.platform.voice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ConsumePayload {
    private String transportId;
    private String producerId;
    private Map<String, Object> rtpCapabilities;
}