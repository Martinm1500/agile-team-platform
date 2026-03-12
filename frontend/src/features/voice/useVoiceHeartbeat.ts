import { useEffect, useRef } from "react";
import { stompClient } from "../messages/stompService";

const HEARTBEAT_INTERVAL_MS = 20_000;
const BACKGROUND_HEARTBEAT_INTERVAL_MS = 30_000;

export function useVoiceHeartbeat(channelId: number | null): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!channelId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const send = () => {
      if (stompClient?.connected) {
        stompClient.publish({ destination: "/app/voice/heartbeat", body: "" });
      }
    };

    const startInterval = (ms: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      send(); // fire immediately when starting or returning to foreground
      intervalRef.current = setInterval(send, ms);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startInterval(HEARTBEAT_INTERVAL_MS);
      } else {
        startInterval(BACKGROUND_HEARTBEAT_INTERVAL_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startInterval(HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [channelId]);
}
