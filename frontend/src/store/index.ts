// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import memberReducer from "../features/members/memberSlice";
import contactReducer from "../features/contacts/contactSlice";
import serverReducer from "../features/servers/serverSlice";
import taskReducer from "../features/kanbanWorkspaces/taskSlice";
import kanbanReducer from "../features/kanbanWorkspaces/kanbanSlice";
import notesWorkspaceReducer from "../features/notesWorkspaces/noteWorkspaceSlice";
import noteReducer from "../features/notes/noteSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import authReducer from "../features/auth/authSlice";
import conversationReducer from "../features/messages/conversationSlice";
import voiceReducer from "../features/voice/voiceSlice";
import specialtiesReducer from "../features/servers/specialtiesSlice";
import projectMemberSlice from "../features/servers/projectMemberSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation: conversationReducer,
    voice: voiceReducer,
    specialties: specialtiesReducer,
    projectMember: projectMemberSlice,
    user: userReducer,
    task: taskReducer,
    kanban: kanbanReducer,
    contact: contactReducer,
    servers: serverReducer,
    members: memberReducer,
    tasks: taskReducer,
    notesWorkspaces: notesWorkspaceReducer,
    notes: noteReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
