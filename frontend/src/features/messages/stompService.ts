// src/features/messages/stompService.ts
import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import type { Message } from "./conversationTypes";

export let stompClient: Client | null = null;

const reconnectCallbacks: (() => void)[] = [];

export const registerReconnectCallback = (callback: () => void) => {
  const exists = reconnectCallbacks.some((cb) => cb === callback);
  if (!exists) {
    reconnectCallbacks.push(callback);
    console.log(`📝 Registered reconnect callback (total: ${reconnectCallbacks.length})`);
  } else {
    console.log(`⚠️ Callback already registered, skipping`);
  }
};

export const unregisterReconnectCallback = (callback: () => void) => {
  const index = reconnectCallbacks.indexOf(callback);
  if (index !== -1) {
    reconnectCallbacks.splice(index, 1);
    console.log(`🗑️ Unregistered reconnect callback (remaining: ${reconnectCallbacks.length})`);
  }
};

type TokenExpiredHandler = () => Promise<void>;
let onTokenExpiredHandler: TokenExpiredHandler | null = null;

export const setTokenExpiredHandler = (handler: TokenExpiredHandler) => {
  onTokenExpiredHandler = handler;
};

let connectResolve: ((client: Client) => void) | null = null;
let connectReject: ((error: Error) => void) | null = null;

const handleConnect = () => {
  console.log("✅ STOMP connected/reconnected");

  if (connectResolve && stompClient) {
    const resolve = connectResolve;
    connectResolve = null;
    connectReject = null;
    resolve(stompClient);
  }

  const callbacksCopy = [...reconnectCallbacks];
  callbacksCopy.forEach((cb, index) => {
    try {
      cb();
    } catch (e) {
      console.error(`❌ Error in reconnect callback #${index}:`, e);
    }
  });
};

const handleStompError = (frame: { body: string }) => {
  console.error("STOMP error:", frame.body);

  if (connectReject) {
    const reject = connectReject;
    connectResolve = null;
    connectReject = null;
    reject(new Error(frame.body));
  }
};

export const connectStomp = (): Promise<Client> => {
  if (stompClient && stompClient.connected) {
    return Promise.resolve(stompClient);
  }

  if (stompClient && !stompClient.connected) {
    console.log("🧹 Cleaning up disconnected STOMP client");
    try {
      stompClient.deactivate();
    } catch (e) {
      console.warn("⚠️ Error deactivating old client:", e);
    }
    stompClient = null;
  }

  const token = localStorage.getItem("accessToken") || "";

  stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    beforeConnect: async () => {
      if (!stompClient) return;

      const freshToken = localStorage.getItem("accessToken") || "";
      stompClient.connectHeaders = {
        Authorization: `Bearer ${freshToken}`,
      };
      console.log("🔑 Updated STOMP connect headers with fresh token");
    },
  });

  stompClient.onConnect = handleConnect;
  stompClient.onStompError = handleStompError;
  stompClient.onWebSocketClose = () => {
    console.log("WebSocket closed");
  };

  return new Promise((resolve, reject) => {
    connectResolve = resolve;
    connectReject = reject;
    stompClient!.activate();
  });
};

export const disconnectStomp = () => {
  console.log("🔌 Disconnecting STOMP");

  if (connectResolve || connectReject) {
    connectResolve = null;
    connectReject = null;
  }

  if (stompClient) {
    stompClient.onConnect = () => {};
    stompClient.onStompError = () => {};
    stompClient.onWebSocketClose = () => {};
    stompClient.onDisconnect = () => {};
    stompClient.onWebSocketError = () => {};

    try {
      stompClient.deactivate();
    } catch (e) {
      console.warn("⚠️ Error during deactivation:", e);
    }
  }

  reconnectCallbacks.length = 0;
  stompClient = null;

  console.log("✅ STOMP fully disconnected and cleaned");
};


export const reconnectWithFreshToken = async (): Promise<void> => {
  console.log("🔄 Reconnecting STOMP with fresh token...");

  if (stompClient) {
    stompClient.onConnect = () => {};
    stompClient.onStompError = () => {};
    stompClient.onWebSocketClose = () => {};
    stompClient.onDisconnect = () => {};
    stompClient.onWebSocketError = () => {};

    try {
      await stompClient.deactivate();
    } catch (e) {
      console.warn("⚠️ Error deactivating client before reconnect:", e);
    }
    stompClient = null;
  }

  await connectStomp();
  console.log("✅ STOMP reconnected with fresh token");
};

export const handleTokenExpiredFromServer = async (): Promise<void> => {
  console.warn("⚠️ TOKEN_EXPIRED received from server");

  if (!onTokenExpiredHandler) {
    console.error("❌ No token expired handler registered, cannot refresh");
    return;
  }

  try {
    await onTokenExpiredHandler();
    await reconnectWithFreshToken();
    console.log("✅ Token refreshed and STOMP reconnected successfully");
  } catch (e) {
    console.error("❌ Failed to refresh token after server expiry notice:", e);
  }
};

type SubscribeResult =
  | StompSubscription
  | Promise<StompSubscription | undefined>
  | undefined;

export const subscribeToTopic = (
  topic: string,
  callback: (message: Message) => void,
): SubscribeResult => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ STOMP client not connected, attempting to connect...");
    return connectStomp()
      .then(() => subscribeToTopic(topic, callback) as StompSubscription | undefined)
      .catch((err) => {
        console.error("❌ Error conectando STOMP para suscripción:", err);
        return undefined;
      });
  }

  return stompClient.subscribe(topic, (msg) => {
    try {
      const parsedMessage = JSON.parse(msg.body) as Message;
      callback(parsedMessage);
    } catch (error) {
      console.error("❌ Error parseando mensaje:", error);
    }
  });
};

export const subscribeGeneral = (
  topic: string,
  callback: (msg: IMessage) => void,
): SubscribeResult => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ STOMP client not connected, attempting to connect...");
    return connectStomp()
      .then(() => subscribeGeneral(topic, callback) as StompSubscription | undefined)
      .catch((err) => {
        console.error("❌ Error conectando STOMP para suscripción:", err);
        return undefined;
      });
  }

  return stompClient.subscribe(topic, callback);
};

export const subscribeGeneralAsync = async (
  topic: string,
  callback: (msg: IMessage) => void,
) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ STOMP client not connected, attempting to connect...");
    await connectStomp();
  }

  if (!stompClient || !stompClient.connected) {
    console.error("❌ No se pudo conectar STOMP");
    return undefined;
  }

  return stompClient.subscribe(topic, callback);
};

export const sendMessage = (destination: string, body: { content: string }) => {
  if (!stompClient || !stompClient.connected) {
    console.error("❌ No se puede enviar: STOMP no conectado");
    return;
  }
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
    headers: {},
  });
};