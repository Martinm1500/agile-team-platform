package dev.martinm.platform.voice.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ProducePayload {
    private String transportId;
    private String kind;
    private Map<String, Object> rtpParameters;
    private Map<String, Object> appData;
}