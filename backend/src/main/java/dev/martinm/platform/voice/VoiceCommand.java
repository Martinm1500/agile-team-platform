package dev.martinm.platform.voice;

import dev.martinm.platform.users.User;
import dev.martinm.platform.voice.dto.ConnectTransportPayload;
import dev.martinm.platform.voice.dto.ConsumePayload;
import dev.martinm.platform.voice.dto.ProducePayload;

public sealed interface VoiceCommand
        permits JoinCmd, LeaveCmd, HeartbeatCmd,
        CreateSendTransportCmd, CreateRecvTransportCmd,
        ConnectTransportCmd, ProduceCmd, ConsumeCmd, MuteCmd {
}

// Core commands
record JoinCmd(Long channelId, User user, Long serverId) implements VoiceCommand {}
record LeaveCmd(Long channelId, Long userId, Long serverId) implements VoiceCommand {}
record HeartbeatCmd(Long channelId, Long userId) implements VoiceCommand {}
record MuteCmd(Long channelId, Long userId, boolean muted) implements VoiceCommand {}

// Transport commands
record CreateSendTransportCmd(Long channelId, Long userId) implements VoiceCommand {}
record CreateRecvTransportCmd(Long channelId, Long userId) implements VoiceCommand {}
record ConnectTransportCmd(Long channelId, Long userId, ConnectTransportPayload payload) implements VoiceCommand {}

// Media commands
record ProduceCmd(Long channelId, Long userId, ProducePayload payload) implements VoiceCommand {}
record ConsumeCmd(Long channelId, Long userId, ConsumePayload payload) implements VoiceCommand {}