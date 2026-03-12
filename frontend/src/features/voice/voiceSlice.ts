import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VoiceConnectionState, ServerPresenceMap } from "./voiceTypes";

interface VoiceState {
  // Active call
  currentChannelId: number | null;
  currentChannelName: string | null;
  currentServerId: number | null;
  connectionState: VoiceConnectionState;
  error: string | null;

  // Local user preferences
  isMuted: boolean;
  isDeafened: boolean;
  userVolumes: Record<number, number>;

  // Server-wide presence (fuente de verdad): serverId → channelId → PresenceUser[]
  serverPresence: Record<number, ServerPresenceMap>;
}

const initialState: VoiceState = {
  currentChannelId: null,
  currentChannelName: null,
  currentServerId: null,
  connectionState: "idle",
  error: null,
  isMuted: false,
  isDeafened: false,
  userVolumes: {},
  serverPresence: {},
};

export const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    // ---------- Connection ----------

    setConnectionState: (
      state,
      action: PayloadAction<{
        state: VoiceConnectionState;
        channelId: number | null;
        channelName?: string | null;
        serverId?: number | null;
        error?: string | null;
      }>,
    ) => {
      state.connectionState = action.payload.state;
      state.currentChannelId = action.payload.channelId;
      state.currentChannelName = action.payload.channelName ?? null;
      if (action.payload.serverId !== undefined) {
        state.currentServerId = action.payload.serverId;
      }
      state.error = action.payload.error ?? null;

      if (
        action.payload.state === "idle" ||
        action.payload.state === "failed"
      ) {
        state.userVolumes = {};
      }
    },

    // ---------- Local preferences ----------

    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },

    setDeafened: (state, action: PayloadAction<boolean>) => {
      state.isDeafened = action.payload;
    },

    setUserVolume: (
      state,
      action: PayloadAction<{ userId: number; volume: number }>,
    ) => {
      const { userId, volume } = action.payload;
      state.userVolumes[userId] = Math.max(0, Math.min(1, volume));
    },

    // ---------- Server-wide presence (fuente de verdad) ----------

    setServerPresence: (
      state,
      action: PayloadAction<{ serverId: number; presence: ServerPresenceMap }>,
    ) => {
      state.serverPresence[action.payload.serverId] = action.payload.presence;
    },

    clearServerPresence: (state, action: PayloadAction<number>) => {
      delete state.serverPresence[action.payload];
    },

    // ---------- Reset ----------

    reset: () => initialState,
  },
});

// ACTIONS

export const {
  setConnectionState,
  setMuted,
  setDeafened,
  setUserVolume,
  setServerPresence,
  clearServerPresence,
  reset,
} = voiceSlice.actions;

// SELECTORS

export const selectVoiceState = (state: { voice: VoiceState }) => state.voice;

export const selectCurrentChannelId = (state: { voice: VoiceState }) =>
  state.voice.currentChannelId;

export const selectCurrentChannelName = (state: { voice: VoiceState }) =>
  state.voice.currentChannelName;

export const selectCurrentServerId = (state: { voice: VoiceState }) =>
  state.voice.currentServerId;

export const selectConnectionState = (state: { voice: VoiceState }) =>
  state.voice.connectionState;

export const selectIsConnected = (state: { voice: VoiceState }) =>
  state.voice.connectionState === "connected";

export const selectIsConnecting = (state: { voice: VoiceState }) =>
  state.voice.connectionState === "connecting";

export const selectIsMuted = (state: { voice: VoiceState }) =>
  state.voice.isMuted;

export const selectIsDeafened = (state: { voice: VoiceState }) =>
  state.voice.isDeafened;

export const selectUserVolume =
  (userId: number) => (state: { voice: VoiceState }) =>
    state.voice.userVolumes[userId] ?? 1;

export const selectError = (state: { voice: VoiceState }) => state.voice.error;

export const selectServerPresence =
  (serverId: number) => (state: { voice: VoiceState }) =>
    state.voice.serverPresence[serverId] ?? {};

export const selectChannelPresence =
  (serverId: number, channelId: number) => (state: { voice: VoiceState }) =>
    state.voice.serverPresence[serverId]?.[channelId] ?? [];

export default voiceSlice.reducer;
