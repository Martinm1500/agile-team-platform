import { useState, useEffect, useCallback, useRef } from "react";
import {
  getChannelMessages,
  getContactMessages,
  markConversationRead,
} from "./messageService";
import { subscribeToTopic, sendMessage } from "./stompService";
import type { StompSubscription } from "@stomp/stompjs";
import type { Conversation, Message } from "./conversationTypes";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { resetShortcutUnread } from "./conversationSlice";

const useMessages = (
  conversation: Conversation,
  updateConversationMessages: (id: number, msgs: Message[]) => void,
  addMessage: (id: number, msg: Message) => void
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<StompSubscription | undefined>(undefined);
  const updateConversationMessagesRef = useRef(updateConversationMessages);
  const addMessageRef = useRef(addMessage);
  useEffect(() => {
    updateConversationMessagesRef.current = updateConversationMessages;
    addMessageRef.current = addMessage;
  }, [updateConversationMessages, addMessage]);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        let msgs: Message[];
        if (conversation.type === "channel") {
          msgs = await getChannelMessages(conversation.channelId!);
        } else {
          msgs = await getContactMessages(conversation.contactId!);
        }
        updateConversationMessagesRef.current(conversation.id, msgs);
        if (msgs.length > 0) {
          await markConversationRead(conversation.id, msgs[msgs.length - 1].id);
        }
        dispatch(resetShortcutUnread(conversation.id));
      } catch (err) {
        setError("Error al cargar mensajes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const topic =
      conversation.type === "channel"
        ? `/topic/channel/${conversation.channelId}`
        : `/topic/dm/${conversation.contactId}`;
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    subscriptionRef.current = subscribeToTopic(
      topic,
      async (newMsg: Message) => {
        addMessageRef.current(conversation.id, newMsg);
        await markConversationRead(conversation.id, newMsg.id);
        dispatch(resetShortcutUnread(conversation.id));
      }
    );
    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = undefined;
    };
  }, [
    conversation.id,
    conversation.type,
    conversation.channelId,
    conversation.contactId,
    dispatch,
  ]);
  const sendMsg = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      try {
        const destination =
          conversation.type === "channel"
            ? `/app/send/channel/${conversation.channelId}`
            : `/app/send/dm/${conversation.contactId}`;
        sendMessage(destination, { content });
      } catch (err) {
        setError("Error al enviar mensaje");
        console.error(err);
      }
    },
    [conversation.type, conversation.channelId, conversation.contactId]
  );
  return {
    loading,
    error,
    sendMessage: sendMsg,
    refresh: useCallback(() => {
      const fetch = async () => {
        try {
          setLoading(true);
          setError(null);
          let msgs: Message[];
          if (conversation.type === "channel") {
            msgs = await getChannelMessages(conversation.channelId!);
          } else {
            msgs = await getContactMessages(conversation.contactId!);
          }
          updateConversationMessagesRef.current(conversation.id, msgs);
          if (msgs.length > 0) {
            await markConversationRead(
              conversation.id,
              msgs[msgs.length - 1].id
            );
          }
          dispatch(resetShortcutUnread(conversation.id));
        } catch (err) {
          setError("Error al cargar mensajes");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetch();
    }, [
      conversation.id,
      conversation.type,
      conversation.channelId,
      conversation.contactId,
      dispatch,
    ]),
  };
};
export default useMessages;
