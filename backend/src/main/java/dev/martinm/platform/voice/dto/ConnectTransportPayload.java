package dev.martinm.platform.voice.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ConnectTransportPayload {
    private String transportId;
    private Map<String, Object> dtlsParameters;
}
