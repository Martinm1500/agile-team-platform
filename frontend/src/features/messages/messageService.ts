import api from "../../lib/axios";
import type { ConversationDTO, Message } from "./conversationTypes";

export const getDMConversation = async (
  contactId: number
): Promise<ConversationDTO> => {
  const res = await api.get<ConversationDTO>(
    `/api/conversations/dm/${contactId}`
  );
  return res.data;
};

export const getChannelMessages = async (
  channelId: number
): Promise<Message[]> => {
  const res = await api.get<Message[]>(
    `/api/messages/channels/${channelId}/messages`
  );
  return res.data;
};

export const getContactMessages = async (
  contactId: number
): Promise<Message[]> => {
  const res = await api.get<Message[]>(
    `/api/messages/contacts/${contactId}/messages`
  );
  return res.data;
};

export const getMyDMStatus = async () => {
  const response = await api.get(`/api/conversations/my/dms`);
  return response.data;
};

export const markConversationRead = async (
  conversationId: number,
  messageId: number
) => {
  const response = await api.post(`/api/messages/mark-read/${conversationId}`, {
    messageId,
  });
  return response.data;
};

export const getServerConversations = async (
  serverId: number
): Promise<ConversationDTO[]> => {
  const res = await api.get<ConversationDTO[]>(
    `/api/conversations/server/${serverId}`
  );
  return res.data;
};

export const getConversationByChannelId = async (
  channelId: number
): Promise<ConversationDTO> => {
  const res = await api.get<ConversationDTO>(`/api/conversations/${channelId}`);
  return res.data;
};
