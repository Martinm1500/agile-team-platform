import { useRef, useCallback } from "react";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { subscribeGeneralAsync } from "../messages/stompService";
import type {
  RtpCapabilitiesMessage,
  TransportMessage,
  ConsumeMessage,
  MuteMessage,
  ConnectResponseMessage,
  ConnectionStateEvent,
} from "./voiceTypes";

export interface SubscriptionHandlers {
  onRtpCapabilities?: (capabilities: RtpCapabilitiesMessage) => void;
  onSendTransportCreated?: (params: TransportMessage) => void;
  onRecvTransportCreated?: (params: TransportMessage) => void;
  onStartProducing?: () => void;
  onConnectResponse?: (response: ConnectResponseMessage) => void;
  onProduceResponse?: (response: { id: string }) => void;
  onConsumeResponse?: (params: ConsumeMessage) => void;
  onUserLeft?: (data: { userId: number }) => void;
  onUserMuted?: (data: MuteMessage) => void;
  onConnectionStateChanged?: (event: ConnectionStateEvent) => void;
  onError?: (error: { error: string; operation?: string }) => void;
}

async function settleSubscriptions(
  pending: Array<Promise<StompSubscription | undefined>>,
  labels: string[],
): Promise<{ failedCount: number; failedLabels: string[] }> {
  const results = await Promise.allSettled(pending);

  const failedLabels: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const label = labels[i] ?? `subscription[${i}]`;
      failedLabels.push(label);
      console.error(
        `[Subscriptions] ❌ Failed to set up "${label}":`,
        result.reason,
      );
    }
  });

  return { failedCount: failedLabels.length, failedLabels };
}

export function useVoiceSubscriptions() {
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  const connectResolversRef = useRef<Map<string, (success: boolean) => void>>(
    new Map(),
  );
  const produceResolverRef = useRef<
    ((response: { id: string }) => void) | null
  >(null);

  const addSub = useCallback(
    (name: string, sub: StompSubscription | undefined) => {
      if (sub) subscriptionsRef.current.set(name, sub);
    },
    [],
  );

  const unsubscribeOne = useCallback((name: string): void => {
    const sub = subscriptionsRef.current.get(name);
    if (sub) {
      try {
        sub.unsubscribe();
        subscriptionsRef.current.delete(name);
      } catch (e) {
        console.warn(`[Subscriptions] Error unsubscribing ${name}:`, e);
      }
    }
  }, []);

  const unsubscribeAll = useCallback((): void => {
    console.log(
      `[Subscriptions] 🧹 Unsubscribing all (${subscriptionsRef.current.size})`,
    );
    subscriptionsRef.current.forEach((sub, name) => {
      try {
        sub.unsubscribe();
      } catch (e) {
        console.warn(`[Subscriptions] Error unsubscribing ${name}:`, e);
      }
    });
    subscriptionsRef.current.clear();
    connectResolversRef.current.clear();
    produceResolverRef.current = null;
  }, []);

  const subscribe = useCallback(
    async (
      channelId: number,
      serverId: number,
      handlers: SubscriptionHandlers,
    ): Promise<void> => {
      console.log(
        `[Subscriptions] 📡 Setting up for channel ${channelId} (server ${serverId})`,
      );

      unsubscribeAll();

      const criticalPending: Array<Promise<StompSubscription | undefined>> = [];
      const criticalLabels: string[] = [];

      const nonCriticalPending: Array<Promise<StompSubscription | undefined>> =
        [];
      const nonCriticalLabels: string[] = [];

      const addCritical = (
        label: string,
        p: Promise<StompSubscription | undefined>,
      ) => {
        criticalPending.push(p);
        criticalLabels.push(label);
      };

      const addNonCritical = (
        label: string,
        p: Promise<StompSubscription | undefined>,
      ) => {
        nonCriticalPending.push(p);
        nonCriticalLabels.push(label);
      };

      if (handlers.onRtpCapabilities) {
        addCritical(
          "rtpCapabilities",
          subscribeGeneralAsync(
            "/user/queue/voice/rtpCapabilities",
            (msg: IMessage) => {
              try {
                handlers.onRtpCapabilities?.(JSON.parse(msg.body));
                unsubscribeOne("rtpCapabilities");
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing RTP capabilities:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("rtpCapabilities", sub);
            return sub;
          }),
        );
      }

      if (handlers.onSendTransportCreated) {
        addCritical(
          "sendTransport",
          subscribeGeneralAsync(
            "/user/queue/voice/createSendTransport",
            (msg: IMessage) => {
              try {
                handlers.onSendTransportCreated?.(JSON.parse(msg.body));
                unsubscribeOne("sendTransport");
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing send transport:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("sendTransport", sub);
            return sub;
          }),
        );
      }

      if (handlers.onRecvTransportCreated) {
        addCritical(
          "recvTransport",
          subscribeGeneralAsync(
            "/user/queue/voice/createRecvTransport",
            (msg: IMessage) => {
              try {
                handlers.onRecvTransportCreated?.(JSON.parse(msg.body));
                unsubscribeOne("recvTransport");
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing recv transport:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("recvTransport", sub);
            return sub;
          }),
        );
      }

      if (handlers.onStartProducing) {
        addCritical(
          "startProducing",
          subscribeGeneralAsync("/user/queue/voice/startProducing", () => {
            try {
              handlers.onStartProducing?.();
              unsubscribeOne("startProducing");
            } catch (e) {
              console.error(
                "[Subscriptions] Error handling start producing:",
                e,
              );
            }
          }).then((sub) => {
            addSub("startProducing", sub);
            return sub;
          }),
        );
      }

      if (handlers.onConnectResponse) {
        addCritical(
          "connectResponse",
          subscribeGeneralAsync(
            "/user/queue/voice/connectResponse",
            (msg: IMessage) => {
              try {
                handlers.onConnectResponse?.(JSON.parse(msg.body));
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing connect response:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("connectResponse", sub);
            return sub;
          }),
        );
      }

      if (handlers.onProduceResponse) {
        addCritical(
          "produceResponse",
          subscribeGeneralAsync(
            "/user/queue/voice/produceResponse",
            (msg: IMessage) => {
              try {
                handlers.onProduceResponse?.(JSON.parse(msg.body));
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing produce response:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("produceResponse", sub);
            return sub;
          }),
        );
      }

      if (handlers.onConsumeResponse) {
        addCritical(
          "consume",
          subscribeGeneralAsync(
            "/user/queue/voice/consume",
            (msg: IMessage) => {
              try {
                handlers.onConsumeResponse?.(JSON.parse(msg.body));
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing consume response:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("consume", sub);
            return sub;
          }),
        );
      }

      if (handlers.onUserLeft) {
        addCritical(
          "userLeft",
          subscribeGeneralAsync(
            `/topic/voice/${channelId}/userLeft`,
            (msg: IMessage) => {
              try {
                const { userId } = JSON.parse(msg.body) as { userId: number };
                handlers.onUserLeft?.({ userId });
              } catch (e) {
                console.error("[Subscriptions] Error parsing userLeft:", e);
              }
            },
          ).then((sub) => {
            addSub("userLeft", sub);
            return sub;
          }),
        );
      }

      // ── Non-critical ─────────────────────────────────────────────────────

      if (handlers.onUserMuted) {
        addNonCritical(
          "mute",
          subscribeGeneralAsync(
            `/topic/voice/${channelId}/mute`,
            (msg: IMessage) => {
              try {
                handlers.onUserMuted?.(JSON.parse(msg.body));
              } catch (e) {
                console.error("[Subscriptions] Error parsing mute status:", e);
              }
            },
          ).then((sub) => {
            addSub("mute", sub);
            return sub;
          }),
        );
      }

      if (handlers.onConnectionStateChanged) {
        addNonCritical(
          "connectionState",
          subscribeGeneralAsync(
            "/user/queue/voice/connectionState",
            (msg: IMessage) => {
              try {
                handlers.onConnectionStateChanged?.(JSON.parse(msg.body));
              } catch (e) {
                console.error(
                  "[Subscriptions] Error parsing connection state:",
                  e,
                );
              }
            },
          ).then((sub) => {
            addSub("connectionState", sub);
            return sub;
          }),
        );
      }

      if (handlers.onError) {
        addNonCritical(
          "error",
          subscribeGeneralAsync("/user/queue/voice/error", (msg: IMessage) => {
            try {
              handlers.onError?.(JSON.parse(msg.body));
            } catch (e) {
              console.error("[Subscriptions] Error parsing error message:", e);
            }
          }).then((sub) => {
            addSub("error", sub);
            return sub;
          }),
        );
      }

      const { failedCount, failedLabels } = await settleSubscriptions(
        criticalPending,
        criticalLabels,
      );

      if (failedCount > 0) {
        unsubscribeAll();
        throw new Error(
          `[Subscriptions] ${failedCount} critical subscription(s) failed to set up: ${failedLabels.join(", ")}. Aborting join.`,
        );
      }

      await settleSubscriptions(nonCriticalPending, nonCriticalLabels).then(
        ({ failedLabels: ncFailed }) => {
          if (ncFailed.length > 0) {
            console.warn(
              `[Subscriptions] ⚠️ ${ncFailed.length} non-critical subscription(s) failed: ${ncFailed.join(", ")}. Voice will work but some features may be degraded.`,
            );
          }
        },
      );

      console.log(
        `[Subscriptions] ✅ ${subscriptionsRef.current.size} subscriptions ready`,
      );
    },
    [unsubscribeAll, unsubscribeOne, addSub],
  );

  const setConnectResolver = useCallback(
    (transportId: string, resolver: (success: boolean) => void): void => {
      connectResolversRef.current.set(transportId, resolver);
    },
    [],
  );

  const resolveConnect = useCallback(
    (transportId: string, success: boolean): void => {
      const resolver = connectResolversRef.current.get(transportId);
      if (resolver) {
        resolver(success);
        connectResolversRef.current.delete(transportId);
      }
    },
    [],
  );

  const setProduceResolver = useCallback(
    (resolver: (response: { id: string }) => void): void => {
      produceResolverRef.current = resolver;
    },
    [],
  );

  const resolveProduce = useCallback((response: { id: string }): void => {
    if (produceResolverRef.current) {
      produceResolverRef.current(response);
      produceResolverRef.current = null;
    }
  }, []);

  return {
    subscribe,
    unsubscribeAll,
    setConnectResolver,
    resolveConnect,
    setProduceResolver,
    resolveProduce,
  };
}
