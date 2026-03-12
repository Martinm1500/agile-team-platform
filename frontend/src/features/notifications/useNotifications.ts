// store/useNotifications.ts
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchUnreadNotifications,
  markAsRead,
  markAllAsRead,
  clearError,
  selectNotifications,
  selectIsLoading,
  selectError,
} from "./notificationSlice";
import { useCallback } from "react";

export const useNotifications = () => {
  const dispatch = useAppDispatch();

  const notifications = useAppSelector(selectNotifications);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const loadNotifications = useCallback(() => {
    dispatch(fetchUnreadNotifications());
  }, [dispatch]);

  return {
    notifications,
    isLoading,
    error,
    loadNotifications,
    markAsRead: (id: number) => dispatch(markAsRead(id)),
    markAllAsRead: () => dispatch(markAllAsRead()),
    clearError: () => dispatch(clearError()),
  };
};
