// src/features/messages/StompProvider.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  connectStomp,
  disconnectStomp,
  registerReconnectCallback,
  unregisterReconnectCallback,
} from "./stompService";

import { StompContext, type StompContextType } from "./StompContext";

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  const registeredCallbacksRef = useRef<Set<() => void>>(new Set());

  const connect = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (isConnectingRef.current) {
      console.log("⚠️ Already connecting, skipping");
      return;
    }

    if (isConnected) {
      console.log("⚠️ Already connected, skipping");
      return;
    }

    isConnectingRef.current = true;

    try {
      await connectStomp();

      if (isMountedRef.current) {
        setIsConnected(true);
        console.log("✅ STOMP connected");
      }
    } catch (error) {
      console.error("❌ Error connecting STOMP:", error);
      if (isMountedRef.current) {
        setIsConnected(false);
      }
    } finally {
      if (isMountedRef.current) {
        isConnectingRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 StompProvider disconnecting");

    const callbacks = Array.from(registeredCallbacksRef.current);
    console.log(
      `🧹 Unregistering ${callbacks.length} callbacks before disconnect`,
    );

    callbacks.forEach((callback) => {
      try {
        unregisterReconnectCallback(callback);
      } catch (e) {
        console.warn("⚠️ Error unregistering callback:", e);
      }
    });
    registeredCallbacksRef.current.clear();

    disconnectStomp();

    if (isMountedRef.current) {
      setIsConnected(false);
    }
  }, []);

  const registerReconnect = useCallback((callback: () => void) => {
    if (!isMountedRef.current) {
      console.warn("⚠️ Component unmounted, not registering callback");
      return;
    }

    registerReconnectCallback(callback);
    registeredCallbacksRef.current.add(callback);

    console.log(
      `📝 Registered callback (total: ${registeredCallbacksRef.current.size})`,
    );
  }, []);

  const unregisterReconnect = useCallback((callback: () => void) => {
    unregisterReconnectCallback(callback);
    registeredCallbacksRef.current.delete(callback);

    console.log(
      `🗑️ Unregistered callback (remaining: ${registeredCallbacksRef.current.size})`,
    );
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const callbacksRef = registeredCallbacksRef;

    return () => {
      console.log("🧹 StompProvider cleanup starting");
      isMountedRef.current = false;

      const callbacksArray = Array.from(callbacksRef.current);
      console.log(
        `🧹 Cleaning up ${callbacksArray.length} registered callbacks`,
      );

      callbacksArray.forEach((callback) => {
        try {
          unregisterReconnectCallback(callback);
        } catch (e) {
          console.warn("⚠️ Error during callback cleanup:", e);
        }
      });

      callbacksRef.current.clear();

      disconnectStomp();

      console.log("✅ StompProvider cleanup complete");
    };
  }, []);

  const value: StompContextType = {
    isConnected,
    connect,
    disconnect,
    registerReconnect,
    unregisterReconnect,
  };

  return (
    <StompContext.Provider value={value}>{children}</StompContext.Provider>
  );
};
