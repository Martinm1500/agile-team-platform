// src/features/server/memberService.ts

import api from "../../lib/axios";
import type { Member } from "../servers/serverTypes";

export const getMembersByServerIdRequest = async (
  serverId: number
): Promise<Member[]> => {
  const res = await api.get<Member[]>(`/api/servers/${serverId}/members`);
  return res.data;
};

export const kickMemberRequest = async (
  serverId: number,
  userId: number
): Promise<void> => {
  const res = await api.delete<void>(
    `/api/servers/${serverId}/members/${userId}/kick`
  );
  return res.data;
};

export const banMemberRequest = async (
  serverId: number,
  userId: number
): Promise<void> => {
  const res = await api.post<void>(
    `/api/servers/${serverId}/members/${userId}/ban`
  );
  return res.data;
};
