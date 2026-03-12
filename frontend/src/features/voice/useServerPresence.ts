import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import type { StompSubscription } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import type { AppDispatch } from "../../store";
import { stompClient, subscribeGeneralAsync } from "../messages/stompService";
import { useStomp } from "../messages/useStomp";
import { setServerPresence, clearServerPresence } from "./voiceSlice";
import type { ServerPresenceMap } from "./voiceTypes";

function requestSnapshot(serverId: number) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: `/app/voice/presence/${serverId}/subscribe`,
      body: "",
    });
  }
}

export function useServerPresence(serverId: number | null): void {
  const dispatch = useDispatch<AppDispatch>();
  const serverIdRef = useRef<number | null>(serverId);
  serverIdRef.current = serverId;
  const { registerReconnect, unregisterReconnect } = useStomp();

  useEffect(() => {
    if (!serverId) return;

    let sub: StompSubscription | undefined;
    let cancelled = false;

    const handleReconnect = () => {
      if (!cancelled && serverIdRef.current) {
        requestSnapshot(serverIdRef.current);
      }
    };

    registerReconnect(handleReconnect);

    subscribeGeneralAsync(
      `/topic/server/${serverId}/voice-presence`,
      (msg: IMessage) => {
        if (cancelled) return;
        try {
          const presence = JSON.parse(msg.body) as ServerPresenceMap;
          dispatch(
            setServerPresence({ serverId: serverIdRef.current!, presence }),
          );
        } catch (e) {
          console.error(`[useServerPresence] Failed to parse presence:`, e);
        }
      },
    ).then((s) => {
      if (cancelled) {
        s?.unsubscribe();
        return;
      }
      sub = s;
      requestSnapshot(serverId);
    });

    return () => {
      cancelled = true;
      sub?.unsubscribe();
      unregisterReconnect(handleReconnect);
      dispatch(clearServerPresence(serverId));
    };
  }, [serverId, dispatch, registerReconnect, unregisterReconnect]);
}
