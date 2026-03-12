import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  setConversations,
  updateConversationMessages,
  addMessageToConversation,
  loadVisibleShortcuts,
  hideConversation,
  showConversation,
  markShortcutUnread,
  resetShortcutUnread,
} from "./conversationSlice";
import { useCallback, useEffect, useRef, useMemo } from "react";
import type { Contact } from "../../types";
import { getDMConversation, getMyDMStatus } from "./messageService";
import type {
  Conversation,
  Shortcut,
  Message,
  User,
} from "./conversationTypes";
import { useContacts } from "../../features/contacts/useContacts";

export const useConversation = (currentUser: User) => {
  const dispatch: AppDispatch = useDispatch();
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations,
  );
  const visibleShortcuts = useSelector(
    (state: RootState) => state.conversation.visibleShortcuts,
  );
  const { findContactByUserId } = useContacts(currentUser.id);
  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      dispatch(loadVisibleShortcuts());
      const syncUnreads = async () => {
        try {
          const statuses = await getMyDMStatus();
          for (const status of statuses) {
            const shortcut: Shortcut = {
              id: status.conversationId,
              otherUserId: status.otherUser.id,
              name: status.otherUser.name,
              avatarUrl: status.otherUser.avatarUrl,
              unread: status.hasUnread,
            };
            if (status.hasUnread) {
              await dispatch(showConversation(shortcut));
            }
          }
        } catch (error) {
          console.error("Error syncing unreads:", error);
        }
      };
      syncUnreads();
    }
  }, [dispatch, currentUser.id]);
  const getOrCreateConversation = useCallback(
    async (contact: Contact): Promise<Conversation> => {
      const existingConversation = conversations.find(
        (conv: Conversation) =>
          conv.type === "dm" && conv.contactId === contact.id,
      );
      if (existingConversation) {
        return existingConversation;
      }
      if (contact.status !== "ACCEPTED") {
        throw new Error("Contact must be ACCEPTED to create conversation");
      }
      try {
        const convDTO = await getDMConversation(contact.id);
        const user =
          contact.requester.id === currentUser.id
            ? contact.target
            : contact.requester;
        const newConversation: Conversation = {
          id: convDTO.id,
          channelId: null,
          contactId: convDTO.contactId,
          name: user.username,
          avatarUrl: user.avatarUrl,
          type: "dm",
          participants: [
            {
              id: currentUser.id,
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl,
            },
            user,
          ],
          messages: [],
          initialized: true,
        };
        dispatch(setConversations([...conversations, newConversation]));
        return newConversation;
      } catch (error) {
        console.error("Error fetching/creating conversation:", error);
        throw error;
      }
    },
    [conversations, dispatch, currentUser],
  );
  const updateConversationMessagesCb = useMemo(
    () => (conversationId: number, messages: Message[]) => {
      dispatch(
        updateConversationMessages({
          conversationId,
          messages,
        }),
      );
    },
    [dispatch],
  );
  const addMessageToConversationCb = useMemo(
    () => (conversationId: number, message: Message) => {
      dispatch(
        addMessageToConversation({
          conversationId,
          message,
        }),
      );
    },
    [dispatch],
  );
  const markShortcutUnreadCb = useCallback(
    (conversationId: number) => {
      dispatch(markShortcutUnread(conversationId));
    },
    [dispatch],
  );
  const resetShortcutUnreadCb = useCallback(
    (conversationId: number) => {
      dispatch(resetShortcutUnread(conversationId));
    },
    [dispatch],
  );
  return {
    conversations,
    visibleShortcuts,
    getOrCreateConversation,
    updateConversationMessages: updateConversationMessagesCb,
    addMessageToConversation: addMessageToConversationCb,
    hideConversation: useCallback(
      (conversationId: number) => {
        dispatch(hideConversation(conversationId));
      },
      [dispatch],
    ),
    showConversation: useCallback(
      (shortcut: Shortcut) => {
        dispatch(showConversation(shortcut));
      },
      [dispatch],
    ),
    getShortcutFromConversation: useCallback(
      (conversation: Conversation): Shortcut => {
        const otherUser = conversation.participants.find(
          (p) => p.id !== currentUser.id,
        );
        if (!otherUser) {
          throw new Error("No other user in conversation");
        }
        return {
          id: conversation.id,
          otherUserId: otherUser.id,
          name: conversation.name,
          avatarUrl: conversation.avatarUrl,
          unread: false,
        };
      },
      [currentUser],
    ),
    markShortcutUnread: markShortcutUnreadCb,
    resetShortcutUnread: resetShortcutUnreadCb,
    findContactByUserId,
  };
};
