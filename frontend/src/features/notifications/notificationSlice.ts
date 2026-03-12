import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Notification } from "../../types";
import {
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notificationService";
import { fetchContacts } from "../../features/contacts/contactSlice";
import { hideConversation } from "../../features/messages/conversationSlice";
import { getMembersByServerId } from "../members/memberSlice";
import { getProjectMembers } from "../servers/projectMemberSlice";
import { getServerById, removeServer } from "../servers/serverSlice";
import { removeProjectMemberLocally } from "../servers/projectMemberSlice";
import type { RootState } from "../../store";

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  error: null,
};

// Thunks
export const fetchUnreadNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>(
  "notification/fetchUnreadNotifications",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const allNotifications = await getUnreadNotifications();
      const removedNotifications = allNotifications.filter((n) =>
        n.type.endsWith("_REMOVED")
      );
      for (const notification of removedNotifications) {
        await markNotificationAsRead(notification.id);

        if (notification.type === "PROJECT_MEMBER_REMOVED") {
          const state = getState() as RootState;
          const currentUser = state.auth.user;
          const projectId = notification.relatedProjectId;
          if (projectId && currentUser?.id) {
            dispatch(
              removeProjectMemberLocally({ projectId, userId: currentUser.id })
            );
          }
        }
      }
      return allNotifications.filter((n) => !n.type.endsWith("_REMOVED"));
    } catch {
      return rejectWithValue("Error al obtener las notificaciones");
    }
  }
);

export const markAsRead = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("notification/markAsRead", async (id, { rejectWithValue }) => {
  try {
    await markNotificationAsRead(id);
    return id;
  } catch {
    return rejectWithValue("Error al marcar como leída");
  }
});

export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notification/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await markAllNotificationsAsRead();
  } catch {
    return rejectWithValue("Error al marcar todas como leídas");
  }
});

export const addNotification = createAsyncThunk<
  Notification,
  Notification,
  { rejectValue: string }
>(
  "notification/addNotification",
  async (notification, { dispatch, rejectWithValue, getState }) => {
    try {
      const type = notification.type;

      if (
        type === "CONTACT_INVITATION_ACCEPTED" ||
        type === "CONTACT_REMOVED"
      ) {
        dispatch(fetchContacts());
      }
      if (type === "CONTACT_REMOVED") {
        dispatch(hideConversation(notification.relatedId!));
      }
      if (type === "SERVER_INVITATION_ACCEPTED") {
        if (notification.relatedServerId) {
          dispatch(getMembersByServerId(notification.relatedServerId));
        } else {
          console.warn(
            "Notificación sin relatedServerId para SERVER_INVITATION_ACCEPTED"
          );
        }
      }
      if (type === "PROJECT_INVITATION_ACCEPTED") {
        if (notification.relatedProjectId) {
          dispatch(getProjectMembers(notification.relatedProjectId));
        } else {
          console.warn(
            "Notificación sin relatedProjectId para PROJECT_INVITATION_ACCEPTED"
          );
        }
      }
      if (type === "SERVER_MEMBER_REMOVED") {
        if (notification.relatedServerId) {
          dispatch(removeServer(notification.relatedServerId));
        } else {
          console.warn(
            "Notificación sin relatedServerId para SERVER_MEMBER_REMOVED"
          );
        }
      }

      if (type === "PROJECT_MEMBER_REMOVED") {
        const state = getState() as RootState;
        const currentUser = state.auth.user;
        const projectId = notification.relatedProjectId;
        if (projectId && currentUser?.id) {
          dispatch(
            removeProjectMemberLocally({ projectId, userId: currentUser.id })
          );
        }
        if (notification.relatedServerId) {
          dispatch(getServerById(notification.relatedServerId));
        }
      }

      if (!type.endsWith("_REMOVED")) {
        dispatch(
          notificationSlice.actions.addNotificationInternal(notification)
        );
      } else {
        await markNotificationAsRead(notification.id);
      }

      return notification;
    } catch {
      return rejectWithValue("Error al agregar la notificación");
    }
  }
);

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotificationInternal: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = [];
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      });
  },
});

export const { addNotificationInternal, clearError } =
  notificationSlice.actions;
export default notificationSlice.reducer;

// Selectors
export const selectNotificationState = (state: {
  notification: NotificationState;
}) => state.notification;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState.notifications
);

export const selectIsLoading = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState.isLoading
);

export const selectError = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState.error
);
