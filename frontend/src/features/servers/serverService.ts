// src/features/servers/serverService.ts
import api from "../../lib/axios";
import type {
  CreateServerRequest,
  UpdateServerRequest,
  ServerFull,
  Server,
  Project,
  CreateProjectRequest,
  UpdateServerMemberRequest,
  Member,
  CreateChannelRequest,
  Channel,
  SendInvitationRequest,
  ServerInvitation,
  AcceptInvitationResponse,
  ProjectDTO,
  JoinServerRequest,
} from "./serverTypes";

export const getServersRequest = async (): Promise<Server[]> => {
  const res = await api.get<Server[]>("/api/servers");
  return res.data;
};

export const getServerByIdRequest = async (id: number): Promise<ServerFull> => {
  const res = await api.get<ServerFull>(`/api/servers/${id}/full`);
  return res.data;
};

export const createServerRequest = async (
  data: CreateServerRequest,
): Promise<ServerFull> => {
  const res = await api.post<ServerFull>("/api/servers", data);
  return res.data;
};

export const createChannelRequest = async (
  data: CreateChannelRequest,
): Promise<Channel> => {
  const res = await api.post<Channel>("/api/channels", data);
  return res.data;
};

export const updateChannelRequest = async (
  channelId: number,
  data: Channel,
): Promise<Channel> => {
  const res = await api.put<Channel>(`/api/channels/${channelId}`, data);
  return res.data;
};

export const updateServerRequest = async (
  data: UpdateServerRequest,
): Promise<Server> => {
  const res = await api.put<Server>(`/api/servers/${data.id}`, data);
  return res.data;
};

export const deleteServerRequest = async (id: number): Promise<void> => {
  await api.delete(`/api/servers/${id}`);
};

export const deleteChannelRequest = async (id: number): Promise<void> => {
  await api.delete(`/api/channels/${id}`);
};

export const createProjectRequest = async (
  serverId: number,
  data: CreateProjectRequest,
): Promise<Project> => {
  const res = await api.post<Project>(
    `/api/servers/${serverId}/projects`,
    data,
  );
  return res.data;
};

export const updateServerMemberRequest = async (
  serverId: number,
  data: UpdateServerMemberRequest,
): Promise<Member> => {
  const res = await api.put<Member>(`/api/servers/${serverId}/members`, data);
  return res.data;
};

export const deleteProjectRequest = async (
  projectId: number,
): Promise<void> => {
  await api.delete(`api/projects/${projectId}`);
};

export const updateProjectRequest = async (
  projectId: number,
  data: ProjectDTO,
): Promise<ProjectDTO> => {
  const res = await api.put<ProjectDTO>(`/api/projects/${projectId}`, data);
  return res.data;
};

export const sendServerInvitationRequest = async (
  serverId: number,
  data: SendInvitationRequest,
): Promise<ServerInvitation> => {
  const res = await api.post<ServerInvitation>(
    `/api/servers/${serverId}/invitations`,
    data,
  );
  return res.data;
};

export const acceptServerInvitationRequest = async (
  serverId: number,
  invitationId: number,
): Promise<AcceptInvitationResponse> => {
  const res = await api.put<AcceptInvitationResponse>(
    `/api/servers/${serverId}/invitations/${invitationId}/accept`,
  );
  return res.data;
};

export const rejectServerInvitationRequest = async (
  serverId: number,
  invitationId: number,
): Promise<void> => {
  const res = await api.post<void>(
    `/api/servers/${serverId}/invitations/${invitationId}/reject`,
  );
  return res.data;
};

export const discoverServersRequest = async (): Promise<Server[]> => {
  const res = await api.get<Server[]>(`/api/servers/discover`);
  return res.data;
};

export const joinServerRequest = async (serverId: number): Promise<void> => {
  const res = await api.post<void>(`/api/servers/${serverId}/join`);
  return res.data;
};

export const requestJoinServerRequest = async (
  serverId: number,
): Promise<void> => {
  const res = await api.post<void>(`/api/servers/${serverId}/join-request`);
  return res.data;
};

export const acceptJoinServerRequest = async (
  serverId: number,
  requestId: number,
): Promise<void> => {
  const res = await api.post<void>(
    `/api/servers/${serverId}/join-request/${requestId}/accept`,
  );
  return res.data;
};

export const rejectJoinServerRequest = async (
  serverId: number,
  requestId: number,
): Promise<void> => {
  const res = await api.post<void>(
    `/api/servers/${serverId}/join-request/${requestId}/reject`,
  );
  return res.data;
};

export const getOutgoingJoinServerRequest = async (): Promise<
  JoinServerRequest[]
> => {
  const res = await api.get<JoinServerRequest[]>(
    `/api/servers/join-request/all`,
  );
  return res.data;
};
// Tipos para parámetros de transporte

export interface TransportParams {
  id: string;
  iceParameters: unknown; // IceParameters de mediasoup
  iceCandidates: unknown[]; // IceCandidate[] de mediasoup
  dtlsParameters: unknown; // DtlsParameters de mediasoup
  sctpParameters?: unknown; // SctpParameters de mediasoup
}
