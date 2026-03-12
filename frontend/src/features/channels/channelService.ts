import api from "../../lib/axios";
import type {
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
} from "./channelSlice";

export const getChannelsRequest = async (): Promise<Channel[]> => {
  return (await api.get<Channel[]>("/api/channels")).data;
};

export const getChannelByIdRequest = async (id: number): Promise<Channel> => {
  return (await api.get<Channel>(`/api/channels/${id}`)).data;
};

export const createChannelRequest = async (
  data: CreateChannelRequest
): Promise<Channel> => {
  return (await api.post<Channel>("/api/channels", data)).data;
};

export const updateChannelRequest = async (
  data: UpdateChannelRequest
): Promise<Channel> => {
  return (await api.put<Channel>(`/api/channels/${data.id}`, data)).data;
};

export const deleteChannelRequest = async (id: number): Promise<void> => {
  await api.delete(`/api/channels/${id}`);
};
