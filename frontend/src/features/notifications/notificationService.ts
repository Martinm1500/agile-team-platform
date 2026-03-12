// store/notificationService.ts
import api from "../../lib/axios";
import type { Notification } from "../../types";

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const res = await api.get<Notification[]>(`/api/notifications/unread`);
  return res.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.post(`/api/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post(`/api/notifications/read-all`);
};
