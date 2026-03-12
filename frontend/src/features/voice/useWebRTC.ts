import { useRef, useCallback } from "react";
import { Device } from "mediasoup-client";
import type {
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  IceParameters,
  IceCandidate,
  SctpParameters,
} from "mediasoup-client/types";
import {
  VoiceError,
  type RemoteConnection,
  type WebRTCConnection,
  type ConsumeMessage,
} from "./voiceTypes";
import {
  cleanupAllResources,
  cleanupAudioElement,
  cleanupConsumer,
} from "./cleanup";

interface UseWebRTCParams {
  onTransportConnect: (
    transportId: string,
    dtlsParameters: DtlsParameters,
  ) => Promise<boolean>;
  onProduce: (
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
  ) => Promise<string>;
}

export interface TransportParams {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  sctpParameters?: SctpParameters;
}

// ID especial para el usuario local
export const LOCAL_USER_ID = -1;

export function useWebRTC({ onTransportConnect, onProduce }: UseWebRTCParams) {
  const connectionRef = useRef<WebRTCConnection>({
    device: null,
    sendTransport: null,
    recvTransport: null,
    producer: null,
    localStream: null,
  });

  const remoteConnectionsRef = useRef<Map<number, RemoteConnection>>(new Map());
  const isCleaningUpRef = useRef(false);

  // ========== AUDIO ANALYSIS ==========

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodesRef = useRef<Map<number, AnalyserNode>>(new Map());

  const getAudioContext = useCallback((): AudioContext => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      audioContextRef.current = new AudioContext();
    }
    // El AudioContext puede quedar suspended hasta una interacción del usuario
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const connectAnalyser = useCallback(
    (userId: number, stream: MediaStream): void => {
      try {
        const audioCtx = getAudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserNodesRef.current.set(userId, analyser);
      } catch (e) {
        console.warn(
          `[WebRTC] Failed to connect analyser for user ${userId}:`,
          e,
        );
      }
    },
    [getAudioContext],
  );

  const disconnectAnalyser = useCallback((userId: number): void => {
    analyserNodesRef.current.delete(userId);
  }, []);

  const getAnalyserNode = useCallback(
    (userId: number): AnalyserNode | undefined =>
      analyserNodesRef.current.get(userId),
    [],
  );

  // ========== DEVICE ==========

  const initializeDevice = useCallback(
    async (rtpCapabilities: RtpCapabilities): Promise<void> => {
      if (connectionRef.current.device) {
        console.warn("[WebRTC] Device already initialized");
        return;
      }

      try {
        const device = new Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        connectionRef.current.device = device;
        console.log("✅ [WebRTC] Device initialized");
      } catch {
        throw new VoiceError(
          "Failed to initialize device",
          "DEVICE_NOT_FOUND",
          false,
        );
      }
    },
    [],
  );

  // ========== MEDIA STREAM ==========

  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      connectionRef.current.localStream = stream;
      return stream;
    } catch (error) {
      if ((error as { name?: string }).name === "NotAllowedError") {
        throw new VoiceError(
          "Microphone permission denied",
          "PERMISSION_DENIED",
          false,
        );
      }
      throw new VoiceError(
        "Failed to get microphone access",
        "DEVICE_NOT_FOUND",
        false,
      );
    }
  }, []);

  // ========== SEND TRANSPORT ==========

  const createSendTransport = useCallback(
    async (params: TransportParams): Promise<void> => {
      const device = connectionRef.current.device;
      if (!device) {
        throw new VoiceError("Device not initialized", "INVALID_STATE", false);
      }

      try {
        const transport = device.createSendTransport(params);

        transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              const success = await onTransportConnect(
                transport.id,
                dtlsParameters,
              );
              if (success) callback();
              else errback(new Error("Transport connect failed"));
            } catch (error) {
              errback(error as Error);
            }
          },
        );

        transport.on(
          "produce",
          async ({ kind, rtpParameters }, callback, errback) => {
            try {
              const producerId = await onProduce(
                transport.id,
                kind,
                rtpParameters,
              );
              callback({ id: producerId });
            } catch (error) {
              errback(error as Error);
            }
          },
        );

        connectionRef.current.sendTransport = transport;
        console.log("✅ [WebRTC] Send transport created");
      } catch {
        throw new VoiceError(
          "Failed to create send transport",
          "TRANSPORT_FAILED",
          true,
        );
      }
    },
    [onTransportConnect, onProduce],
  );

  // ========== RECV TRANSPORT ==========

  const createRecvTransport = useCallback(
    async (params: TransportParams): Promise<void> => {
      const device = connectionRef.current.device;
      if (!device) {
        throw new VoiceError("Device not initialized", "INVALID_STATE", false);
      }

      try {
        const transport = device.createRecvTransport(params);

        transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              const success = await onTransportConnect(
                transport.id,
                dtlsParameters,
              );
              if (success) callback();
              else errback(new Error("Transport connect failed"));
            } catch (error) {
              errback(error as Error);
            }
          },
        );

        connectionRef.current.recvTransport = transport;
        console.log("✅ [WebRTC] Recv transport created");
      } catch {
        throw new VoiceError(
          "Failed to create recv transport",
          "TRANSPORT_FAILED",
          true,
        );
      }
    },
    [onTransportConnect],
  );

  // ========== PRODUCER ==========

  const startProducing = useCallback(async (): Promise<void> => {
    const { sendTransport, localStream, producer } = connectionRef.current;

    if (producer) {
      console.warn("[WebRTC] Already producing");
      return;
    }

    if (!sendTransport || !localStream) {
      throw new VoiceError(
        "Transport or stream not ready",
        "INVALID_STATE",
        false,
      );
    }

    try {
      const track = localStream.getAudioTracks()[0];
      connectionRef.current.producer = await sendTransport.produce({ track });

      // Conectar el analyser al stream local para detectar cuando el propio
      // usuario está hablando (usando LOCAL_USER_ID como identificador)
      connectAnalyser(LOCAL_USER_ID, localStream);

      console.log("✅ [WebRTC] Started producing audio");
    } catch {
      throw new VoiceError("Failed to produce audio", "PRODUCER_FAILED", true);
    }
  }, [connectAnalyser]);

  // ========== CONSUMER ==========

  const createConsumerFromParams = useCallback(
    async (params: ConsumeMessage): Promise<void> => {
      const { recvTransport } = connectionRef.current;

      if (!recvTransport) {
        throw new VoiceError(
          "Recv transport not ready",
          "INVALID_STATE",
          false,
        );
      }

      const { userId } = params;

      if (remoteConnectionsRef.current.has(userId)) {
        console.warn(`[WebRTC] Already consuming from user ${userId}`);
        return;
      }

      try {
        const consumer = await recvTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        const stream = new MediaStream([consumer.track]);
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.style.display = "none";
        document.body.appendChild(audio);

        remoteConnectionsRef.current.set(userId, {
          userId,
          consumer,
          audioElement: audio,
        });

        // Conectar el analyser al stream del usuario remoto
        connectAnalyser(userId, stream);

        await consumer.resume();

        console.log(`✅ [WebRTC] Consumer created for user ${userId}`);
      } catch {
        throw new VoiceError(
          `Failed to create consumer for user ${userId}`,
          "CONSUMER_FAILED",
          true,
        );
      }
    },
    [connectAnalyser],
  );

  const removeConsumer = useCallback(
    async (userId: number): Promise<void> => {
      const connection = remoteConnectionsRef.current.get(userId);
      if (!connection) return;

      disconnectAnalyser(userId);
      await cleanupAudioElement(connection.audioElement);
      cleanupConsumer(connection.consumer);
      remoteConnectionsRef.current.delete(userId);

      console.log(`✅ [WebRTC] Removed consumer for user ${userId}`);
    },
    [disconnectAnalyser],
  );

  // ========== MUTE / VOLUME ==========

  const setMuted = useCallback((muted: boolean): void => {
    const { producer, localStream } = connectionRef.current;

    if (producer) {
      if (muted) producer.pause();
      else producer.resume();
    }

    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) track.enabled = !muted;
    }
  }, []);

  const setUserVolume = useCallback((userId: number, volume: number): void => {
    const connection = remoteConnectionsRef.current.get(userId);
    if (connection) {
      connection.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // ========== CLEANUP ==========

  const cleanup = useCallback(async (): Promise<void> => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    try {
      console.log("[WebRTC] 🧹 Cleaning up...");

      // Limpiar todos los analysers
      analyserNodesRef.current.clear();

      // Cerrar el AudioContext
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        await audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      const cleanupPromises: Promise<void>[] = [];
      for (const connection of remoteConnectionsRef.current.values()) {
        cleanupPromises.push(cleanupAudioElement(connection.audioElement));
        cleanupConsumer(connection.consumer);
      }
      remoteConnectionsRef.current.clear();

      await cleanupAllResources({
        localStream: connectionRef.current.localStream,
        producer: connectionRef.current.producer,
        sendTransport: connectionRef.current.sendTransport,
        recvTransport: connectionRef.current.recvTransport,
      });

      connectionRef.current = {
        device: null,
        sendTransport: null,
        recvTransport: null,
        producer: null,
        localStream: null,
      };

      await Promise.allSettled(cleanupPromises);
      console.log("✅ [WebRTC] Cleanup complete");
    } finally {
      isCleaningUpRef.current = false;
    }
  }, []);

  // ========== GETTERS ==========

  const getRemoteUsers = useCallback(
    (): number[] => Array.from(remoteConnectionsRef.current.keys()),
    [],
  );

  return {
    initializeDevice,
    getLocalStream,
    createSendTransport,
    createRecvTransport,
    startProducing,
    createConsumerFromParams,
    removeConsumer,
    setMuted,
    setUserVolume,
    getRemoteUsers,
    getAnalyserNode,
    cleanup,
  };
}
