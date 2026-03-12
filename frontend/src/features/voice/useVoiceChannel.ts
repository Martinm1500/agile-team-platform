import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { stompClient, connectStomp } from "../messages/stompService";
import { useWebRTC } from "./useWebRTC";
import { useVoiceSubscriptions } from "./useVoiceSubscriptions";
import { useVoiceHeartbeat } from "./useVoiceHeartbeat";
import { VoiceError } from "./voiceTypes";
import {
  setConnectionState,
  setMuted as setMutedAction,
  selectVoiceState,
} from "./voiceSlice";
import { selectChannelById } from "../servers/serverSlice";

export function useVoiceChannel() {
  const dispatch = useDispatch<AppDispatch>();
  const voiceState = useSelector(selectVoiceState);
  const store = useStore<RootState>();
  const isMountedRef = useRef(true);

  const currentChannelIdRef = useRef<number | null>(
    voiceState.currentChannelId,
  );
  currentChannelIdRef.current = voiceState.currentChannelId;

  const currentServerIdRef = useRef<number | null>(voiceState.currentServerId);
  currentServerIdRef.current = voiceState.currentServerId;

  const pendingLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [heartbeatChannelId, setHeartbeatChannelId] = useState<number | null>(
    null,
  );

  useVoiceHeartbeat(heartbeatChannelId);

  // ========== STOMP ==========

  const sendStompMessage = useCallback(
    (destination: string, body?: object): void => {
      if (!stompClient?.connected) {
        console.warn("[VoiceChannel] STOMP not connected");
        return;
      }
      stompClient.publish({
        destination,
        body: body ? JSON.stringify(body) : "",
      });
    },
    [],
  );

  const subscriptions = useVoiceSubscriptions();

  // ========== WEBRTC ==========

  const webrtc = useWebRTC({
    onTransportConnect: useCallback(
      async (transportId: string, dtlsParameters: unknown) => {
        const channelId = currentChannelIdRef.current;
        if (!channelId) return false;

        sendStompMessage(`/app/voice/connectTransport/${channelId}`, {
          transportId,
          dtlsParameters,
        });

        return new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 10_000);
          subscriptions.setConnectResolver(transportId, (success) => {
            clearTimeout(timeout);
            resolve(success);
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sendStompMessage, subscriptions.setConnectResolver],
    ),

    onProduce: useCallback(
      async (transportId: string, kind: unknown, rtpParameters: unknown) => {
        const channelId = currentChannelIdRef.current;
        if (!channelId) throw new Error("No channel ID");

        sendStompMessage(`/app/voice/produce/${channelId}`, {
          transportId,
          kind,
          rtpParameters,
        });

        return new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Produce timeout")),
            10_000,
          );
          subscriptions.setProduceResolver((response) => {
            clearTimeout(timeout);
            resolve(response.id);
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sendStompMessage, subscriptions.setProduceResolver],
    ),
  });

  // ========== JOIN ==========

  const isMutedRef = useRef(voiceState.isMuted);
  isMutedRef.current = voiceState.isMuted;

  const joinChannel = useCallback(
    async (targetChannelId: number, serverId: number): Promise<void> => {
      if (!isMountedRef.current) return;

      currentServerIdRef.current = serverId;
      const channelName = selectChannelById(store.getState(), targetChannelId)?.name ?? null;

      try {
        console.log(`[VoiceChannel] 🚪 Joining channel ${targetChannelId}`);

        const stream = await webrtc.getLocalStream();
        if (!isMountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        await subscriptions.subscribe(targetChannelId, serverId, {
          onRtpCapabilities: async (capabilities) => {
            console.log("[VoiceChannel] 📡 RTP capabilities received");
            try {
              await webrtc.initializeDevice(capabilities);
            } catch (err) {
              console.error("[VoiceChannel] Failed to initialize device:", err);
            }
          },

          onSendTransportCreated: async (params) => {
            console.log("[VoiceChannel] 📡 Send transport received");
            try {
              await webrtc.createSendTransport(params);
            } catch (err) {
              console.error(
                "[VoiceChannel] Failed to create send transport:",
                err,
              );
            }
          },

          onRecvTransportCreated: async (params) => {
            console.log("[VoiceChannel] 📡 Recv transport received");
            try {
              await webrtc.createRecvTransport(params);
            } catch (err) {
              console.error(
                "[VoiceChannel] Failed to create recv transport:",
                err,
              );
            }
          },

          onStartProducing: async () => {
            console.log("[VoiceChannel] 📡 Start producing signal received");
            try {
              if (!isMountedRef.current) return;
              await webrtc.startProducing();
              webrtc.setMuted(isMutedRef.current);
              setHeartbeatChannelId(targetChannelId);
              console.log(
                `[VoiceChannel] ✅ Producing for channel ${targetChannelId}`,
              );
            } catch (err) {
              console.error("[VoiceChannel] Failed to start producing:", err);
            }
          },

          onConnectResponse: (response) => {
            subscriptions.resolveConnect(
              response.transportId,
              response.success,
            );
          },

          onProduceResponse: (response) => {
            subscriptions.resolveProduce(response);
          },

          onConsumeResponse: async (params) => {
            console.log(
              `[VoiceChannel] 📡 Consume params received for user ${params.userId}`,
            );
            try {
              await webrtc.createConsumerFromParams(params);
            } catch (err) {
              console.error(
                `[VoiceChannel] Failed to create consumer for user ${params.userId}:`,
                err,
              );
            }
          },

          onUserLeft: async ({ userId }) => {
            console.log(`[VoiceChannel] 👋 User ${userId} left`);
            try {
              await webrtc.removeConsumer(userId);
            } catch (err) {
              console.warn(
                `[VoiceChannel] Failed to remove consumer for user ${userId}:`,
                err,
              );
            }
          },

          onUserMuted: (data) => {
            console.log(
              `[VoiceChannel] 🔇 User ${data.userId} muted=${data.muted}`,
            );
          },

          onConnectionStateChanged: (event) => {
            console.log(`[VoiceChannel] 📡 State → ${event.state}`);

            if (event.state === "idle") {
              if (pendingLeaveTimeoutRef.current) {
                clearTimeout(pendingLeaveTimeoutRef.current);
                pendingLeaveTimeoutRef.current = null;
                console.log("[VoiceChannel] ✅ Leave timeout cancelled - confirmation received");
              }
            }

            if (event.state === "connected" && event.channelId) {
              setHeartbeatChannelId(event.channelId);
            } else if (event.state === "idle" || event.state === "failed") {
              setHeartbeatChannelId(null);
            }

            dispatch(
              setConnectionState({
                state: event.state,
                channelId: event.channelId,
                channelName: channelName,
                serverId: serverId,
                error: event.error,
              }),
            );
          },

          onError: (errorData) => {
            console.error("[VoiceChannel] Voice error:", errorData);
            setHeartbeatChannelId(null);
            
            if (pendingLeaveTimeoutRef.current) {
              clearTimeout(pendingLeaveTimeoutRef.current);
              pendingLeaveTimeoutRef.current = null;
            }
            
            dispatch(
              setConnectionState({
                state: "failed",
                channelId: targetChannelId,
                serverId: currentServerIdRef.current,
                error: errorData.error,
              }),
            );
          },
        });

        sendStompMessage(`/app/voice/join/${targetChannelId}`);

        console.log("[VoiceChannel] ✅ Join request sent");
      } catch (err) {
        console.error("[VoiceChannel] Failed to join channel:", err);

        setHeartbeatChannelId(null);

        const voiceError =
          err instanceof VoiceError
            ? err
            : new VoiceError(
                err instanceof Error ? err.message : "Failed to join channel",
                "CONNECTION_FAILED",
                true,
              );

        dispatch(
          setConnectionState({
            state: "failed",
            channelId: targetChannelId,
            serverId: currentServerIdRef.current,
            error: voiceError.message,
          }),
        );

        await webrtc.cleanup();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [webrtc, subscriptions, sendStompMessage],
  );

  // ========== LEAVE ==========

  const leaveChannel = useCallback(async (): Promise<void> => {
    const channelId = currentChannelIdRef.current;
    if (!channelId) {
      console.warn("[VoiceChannel] No channel to leave");
      return;
    }

    console.log(`[VoiceChannel] 🚪 Leaving channel ${channelId}`);
    setHeartbeatChannelId(null);

    const sendLeave = async (): Promise<void> => {
      if (stompClient?.connected) {
        stompClient.publish({ destination: "/app/voice/leave", body: "" });
        return;
      }
      console.warn(
        "[VoiceChannel] STOMP not connected, attempting reconnect before leave...",
      );
      try {
        await Promise.race([
          connectStomp(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Leave STOMP reconnect timeout")),
              3000,
            ),
          ),
        ]);
        stompClient?.publish({ destination: "/app/voice/leave", body: "" });
      } catch (err) {
        console.warn(
          "[VoiceChannel] Could not send leave message, backend will cleanup via heartbeat:",
          err,
        );
      }
    };

    try {
      await sendLeave();
      
      await webrtc.cleanup();

      pendingLeaveTimeoutRef.current = setTimeout(() => {
        if (currentChannelIdRef.current === channelId) {
          console.warn(
            "[VoiceChannel] ⚠️ Leave confirmation timeout - forcing cleanup"
          );
          subscriptions.unsubscribeAll();
          dispatch(
            setConnectionState({
              state: "idle",
              channelId: null,
              channelName: null,
              serverId: null,
            })
          );
        }
        pendingLeaveTimeoutRef.current = null;
      }, 5000);

      console.log(
        "[VoiceChannel] ✅ Leave request sent, waiting for backend confirmation",
      );
    } catch (err) {
      console.error("[VoiceChannel] Error leaving channel:", err);
      
      if (pendingLeaveTimeoutRef.current) {
        clearTimeout(pendingLeaveTimeoutRef.current);
        pendingLeaveTimeoutRef.current = null;
      }
      
      subscriptions.unsubscribeAll();
      dispatch(
        setConnectionState({
          state: "idle",
          channelId: null,
          channelName: null,
          serverId: null,
        }),
      );
    }
  }, [webrtc, subscriptions, dispatch]);

  // ========== CONTROLS ==========

  const setMute = useCallback(
    (muted: boolean): void => {
      webrtc.setMuted(muted);
      dispatch(setMutedAction(muted));

      const channelId = currentChannelIdRef.current;
      if (channelId) {
        sendStompMessage(`/app/voice/mute/${channelId}`, { muted });
      }
    },
    [webrtc, sendStompMessage, dispatch],
  );

  const toggleDeafen = useCallback(
    (deafened: boolean): void => {
      webrtc
        .getRemoteUsers()
        .forEach((userId) => webrtc.setUserVolume(userId, deafened ? 0 : 1));
    },
    [webrtc],
  );

  const setUserVolume = useCallback(
    (userId: number, volume: number): void => {
      webrtc.setUserVolume(userId, volume);
    },
    [webrtc],
  );

  // ========== CLEANUP ==========

  const webrtcRef = useRef(webrtc);
  webrtcRef.current = webrtc;
  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      setHeartbeatChannelId(null);
      
      if (pendingLeaveTimeoutRef.current) {
        clearTimeout(pendingLeaveTimeoutRef.current);
        pendingLeaveTimeoutRef.current = null;
      }
      
      subscriptionsRef.current.unsubscribeAll();
      webrtcRef.current.cleanup();
    };
  }, []);

  // ========== PUBLIC API ==========

  return {
    state: voiceState.connectionState,
    channelId: voiceState.currentChannelId,
    channelName: voiceState.currentChannelName,
    serverId: voiceState.currentServerId,
    error: voiceState.error,
    isMuted: voiceState.isMuted,
    isDeafened: voiceState.isDeafened,
    joinChannel,
    leaveChannel,
    setMute,
    toggleDeafen,
    setUserVolume,
    isConnected: voiceState.connectionState === "connected",
    isConnecting: voiceState.connectionState === "connecting",
    getAnalyserNode: webrtc.getAnalyserNode,
  };
}