// src/features/user/userService.ts
import api from "../../lib/axios";
import type { User } from "../../types";
import type { Profile, Settings } from "./userTypes";

export const getProfileRequest = async (): Promise<Profile> => {
  const res = await api.get<Profile>("/api/users/me");
  return res.data;
};

export const getSettingsRequest = async (): Promise<Settings> => {
  const res = await api.get<Settings>("/api/users/me/settings");
  return res.data;
};

export const updateProfileRequest = async (
  data: Partial<Profile>
): Promise<Profile> => {
  const res = await api.put<Profile>("/api/users/me", data);
  return res.data;
};

export const updateSettingsRequest = async (
  data: Partial<Settings>
): Promise<Settings> => {
  const res = await api.put<Settings>("/api/users/me/settings", data);
  return res.data;
};

export const updatePasswordRequest = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.put("/api/users/me/password", data);
};

export const getUserByUsernameRequest = async (
  username: string
): Promise<User> => {
  const res = await api.get<User>(`/api/users`, {
    params: { username },
  });
  return res.data;
};

export const deleteAccountRequest = async (): Promise<void> => {
  await api.delete("/api/users/me");
};
