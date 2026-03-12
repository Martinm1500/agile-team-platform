import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Conversation, Message, Shortcut } from "./conversationTypes";
import type { RootState } from "../../store";
import type { IncomingMessageNotification } from "./conversationTypes";
import { getDMConversation } from "./messageService";

interface ConversationState {
  conversations: Conversation[];
  visibleShortcuts: Shortcut[];
  selectedConversationId: number | null;
}

const initialState: ConversationState = {
  conversations: [],
  visibleShortcuts: [],
  selectedConversationId: null,
};

export const loadVisibleShortcuts = createAsyncThunk(
  "conversation/loadVisibleShortcuts",
  async (_, { dispatch }) => {
    try {
      const cachedData = localStorage.getItem("visibleConversationShortcuts");
      const visibleShortcuts: Shortcut[] = cachedData
        ? JSON.parse(cachedData)
        : [];
      dispatch(setVisibleShortcuts(visibleShortcuts));
    } catch (error) {
      console.error("❌ Error loading from cache:", error);
      dispatch(setVisibleShortcuts([]));
    }
  }
);

export const hideConversation = createAsyncThunk(
  "conversation/hideConversation",
  async (conversationId: number, { dispatch, getState }) => {
    dispatch(hideConversationReducer(conversationId));
    const { conversation } = getState() as RootState;
    try {
      localStorage.setItem(
        "visibleConversationShortcuts",
        JSON.stringify(conversation.visibleShortcuts)
      );
      console.log("Saved after hide:", conversation.visibleShortcuts);
    } catch (error) {
      console.error("❌ Error saving to cache:", error);
    }
  }
);

export const showConversation = createAsyncThunk(
  "conversation/showConversation",
  async (shortcut: Shortcut, { dispatch, getState }) => {
    dispatch(showConversationReducer(shortcut));
    const { conversation } = getState() as RootState;
    try {
      localStorage.setItem(
        "visibleConversationShortcuts",
        JSON.stringify(conversation.visibleShortcuts)
      );
      console.log("Saved after show:", conversation.visibleShortcuts);
    } catch (error) {
      console.error("❌ Error saving to cache:", error);
    }
  }
);

export const markShortcutUnread = createAsyncThunk(
  "conversation/markShortcutUnread",
  async (conversationId: number, { dispatch, getState }) => {
    dispatch(markShortcutUnreadReducer(conversationId));
    const { conversation } = getState() as RootState;
    try {
      localStorage.setItem(
        "visibleConversationShortcuts",
        JSON.stringify(conversation.visibleShortcuts)
      );
      console.log("Saved after mark unread:", conversation.visibleShortcuts);
    } catch (error) {
      console.error("❌ Error saving to cache:", error);
    }
  }
);

export const resetShortcutUnread = createAsyncThunk(
  "conversation/resetShortcutUnread",
  async (conversationId: number, { dispatch, getState }) => {
    dispatch(resetShortcutUnreadReducer(conversationId));
    const { conversation } = getState() as RootState;
    try {
      localStorage.setItem(
        "visibleConversationShortcuts",
        JSON.stringify(conversation.visibleShortcuts)
      );
      console.log("Saved after reset unread:", conversation.visibleShortcuts);
    } catch (error) {
      console.error("❌ Error saving to cache:", error);
    }
  }
);

export const handleIncomingMessageNotification = createAsyncThunk(
  "conversation/handleIncomingMessageNotification",
  async (notif: IncomingMessageNotification, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { contactId, senderId, conversationId } = notif;

    console.log("📩 Incoming message:", {
      contactId,
      senderId,
      conversationId,
    });

    let conv = conversationId
      ? state.conversation.conversations.find((c) => c.id === conversationId)
      : state.conversation.conversations.find((c) => c.contactId === contactId);

    console.log("Conversation found locally:", !!conv);

    if (!conv) {
      console.log("🔍 Conversation not found locally, creating...");

      const currentUserId = state.auth.user?.id;
      if (!currentUserId) {
        console.error("❌ Current user ID not found");
        return;
      }

      const contacts = state.contact.contacts;
      const contact = contacts.find(
        (c) =>
          (c.requester.id === senderId && c.target.id === currentUserId) ||
          (c.target.id === senderId && c.requester.id === currentUserId)
      );

      console.log("Contact found:", !!contact);
      if (!contact) {
        console.error("❌ Contact not found for sender:", senderId);
        return;
      }

      if (contact.status !== "ACCEPTED") {
        console.error("❌ Contact not ACCEPTED");
        return;
      }

      const convDTO = await getDMConversation(contact.id);
      const user =
        contact.requester.id === currentUserId
          ? contact.target
          : contact.requester;
      const newConversation: Conversation = {
        id: convDTO.id,
        channelId: null,
        contactId: convDTO.contactId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        type: "dm",
        participants: [
          {
            id: currentUserId,
            name: state.auth.user?.name || "",
            avatarUrl: state.auth.user?.avatarUrl || "",
          },
          user,
        ],
        messages: [],
        initialized: true,
      };
      dispatch(
        setConversations([...state.conversation.conversations, newConversation])
      );
      conv = newConversation;
      console.log("✅ Conversation created/fetched:", conv.id);
    } else {
      console.log("✅ Conversation found locally:", conv.id);
    }

    const otherUser = conv.participants.find(
      (p) => p.id !== state.auth.user?.id
    );
    if (!otherUser) {
      console.error("❌ No other user in conversation");
      return;
    }

    const shortcut = {
      id: conv.id,
      otherUserId: otherUser.id,
      name: conv.name,
      avatarUrl: conv.avatarUrl,
      unread: false,
    };

    const existingShortcut = state.conversation.visibleShortcuts.find(
      (s) => s.id === conv.id
    );
    console.log("Shortcut exists in visible:", !!existingShortcut);

    if (!existingShortcut) {
      console.log("Showing new shortcut:", shortcut);
      await dispatch(showConversation(shortcut));
    }

    const selectedId = state.conversation.selectedConversationId;
    if (selectedId !== conv.id) {
      dispatch(markShortcutUnread(conv.id));
      console.log("Marked unread for conv.id:", conv.id);
    }
  }
);

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    updateConversationMessages: (
      state,
      action: PayloadAction<{ conversationId: number; messages: Message[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      const index = state.conversations.findIndex(
        (conv) => conv.id === conversationId
      );
      if (index !== -1) {
        state.conversations = state.conversations.map((c, i) =>
          i === index ? { ...c, messages } : c
        );
      }
    },
    addMessageToConversation: (
      state,
      action: PayloadAction<{ conversationId: number; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      const index = state.conversations.findIndex(
        (conv) => conv.id === conversationId
      );
      if (index !== -1) {
        state.conversations[index].messages.push(message);
      }
    },
    updateConversationId: (
      state,
      action: PayloadAction<{ oldId: number; newId: number }>
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.oldId
      );
      if (index !== -1) {
        state.conversations[index].id = action.payload.newId;
      }
    },
    setVisibleShortcuts: (state, action: PayloadAction<Shortcut[]>) => {
      state.visibleShortcuts = action.payload.map((s) => ({
        ...s,
        unread: s.unread ?? false,
      }));
    },
    hideConversationReducer: (state, action: PayloadAction<number>) => {
      state.visibleShortcuts = state.visibleShortcuts.filter(
        (s) => s.id !== action.payload
      );
    },

    showConversationReducer: (state, action: PayloadAction<Shortcut>) => {
      const existingShortcutIndex = state.visibleShortcuts.findIndex(
        (s) => s.id === action.payload.id
      );

      if (existingShortcutIndex !== -1) {
        state.visibleShortcuts[existingShortcutIndex] = {
          ...action.payload,
          unread:
            state.visibleShortcuts[existingShortcutIndex].unread ||
            action.payload.unread ||
            false,
        };
      } else {
        const shortcutWithUnread = {
          ...action.payload,
          unread: action.payload.unread || false,
        };
        state.visibleShortcuts.unshift(shortcutWithUnread);
      }
    },
    markShortcutUnreadReducer: (state, action: PayloadAction<number>) => {
      state.visibleShortcuts = state.visibleShortcuts.map((s) =>
        s.id === action.payload ? { ...s, unread: true } : s
      );
    },
    resetShortcutUnreadReducer: (state, action: PayloadAction<number>) => {
      state.visibleShortcuts = state.visibleShortcuts.map((s) =>
        s.id === action.payload ? { ...s, unread: false } : s
      );
    },
    setSelectedConversationId: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.selectedConversationId = action.payload;
    },
  },
});

export const {
  setConversations,
  updateConversationMessages,
  addMessageToConversation,
  updateConversationId,
  setVisibleShortcuts,
  hideConversationReducer,
  showConversationReducer,
  markShortcutUnreadReducer,
  resetShortcutUnreadReducer,
  setSelectedConversationId,
} = conversationSlice.actions;
export default conversationSlice.reducer;
