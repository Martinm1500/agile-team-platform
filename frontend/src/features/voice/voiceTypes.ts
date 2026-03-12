import type {
  Device,
  Transport,
  Producer,
  Consumer,
  RtpCapabilities,
  RtpCodecCapability,
  RtpHeaderExtension,
  IceParameters,
  IceCandidate,
  DtlsParameters,
  SctpParameters,
  RtpParameters,
  MediaKind,
} from "mediasoup-client/types";

export type VoiceConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "failed";

export interface PresenceUser {
  id: number;
  username: string;
  avatarUrl: string | null;
  muted: boolean;
}

/** channelId → list of users currently in that channel */
export type ServerPresenceMap = Record<number, PresenceUser[]>;

// WEBRTC LOCAL TYPES

export interface WebRTCConnection {
  device: Device | null;
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producer: Producer | null;
  localStream: MediaStream | null;
}

export interface RemoteConnection {
  userId: number;
  consumer: Consumer;
  audioElement: HTMLAudioElement;
}

export type VoiceErrorCode =
  | "PERMISSION_DENIED"
  | "DEVICE_NOT_FOUND"
  | "CONNECTION_FAILED"
  | "TRANSPORT_FAILED"
  | "PRODUCER_FAILED"
  | "CONSUMER_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INVALID_STATE";

export class VoiceError extends Error {
  public readonly code: VoiceErrorCode;
  public readonly recoverable: boolean;

  constructor(message: string, code: VoiceErrorCode, recoverable = false) {
    super(message);
    this.name = "VoiceError";
    this.code = code;
    this.recoverable = recoverable;
  }
}

// BACKEND MESSAGE TYPES (wire format)
export interface RtpCapabilitiesMessage extends RtpCapabilities {
  codecs: RtpCodecCapability[];
  headerExtensions: RtpHeaderExtension[];
}

export interface TransportMessage {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  sctpParameters?: SctpParameters;
}

export interface ProducerMessage {
  id: string;
  userId: number;
}

export interface ConsumeMessage {
  id: string;
  producerId: string;
  userId: number;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  type: "simple" | "simulcast" | "svc";
  paused?: boolean;
}

export interface MuteMessage {
  userId: number;
  muted: boolean;
}

export interface ConnectResponseMessage {
  success: boolean;
  transportId: string;
}

export interface ConnectionStateEvent {
  state: VoiceConnectionState;
  channelId: number | null;
  channelName?: string | null;
  serverId?: number | null;
  error?: string;
}