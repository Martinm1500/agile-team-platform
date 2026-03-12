import React, { useEffect, useRef } from "react";
import MessageComponent from "./MessageComponent";
import MessageInput from "./MessageInput";
import useMessages from "../../features/messages/useMessages";
import { useConversation } from "../../features/messages/useConversation";
import { CommentDotsIcon, UserIcon, PhoneIcon } from "../Icons";
import styles from "./Conversation.module.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type {
  Conversation,
  User,
  Message as MessageType,
} from "../../features/messages/conversationTypes";

interface ConversationProps {
  conversation: Conversation;
  onBack: () => void;
  currentUser: User;
}

const ConversationChannel: React.FC<ConversationProps> = ({
  conversation,
  onBack,
  currentUser,
}) => {
  const { updateConversationMessages, addMessageToConversation } =
    useConversation(currentUser);

  const { loading, sendMessage } = useMessages(
    conversation,
    updateConversationMessages,
    addMessageToConversation,
  );

  const messages = useSelector(
    (state: RootState) =>
      state.conversation.conversations.find(
        (conv) => conv.id === conversation.id,
      )?.messages || [],
  );
  const visibleShortcuts = useSelector(
    (state: RootState) => state.conversation.visibleShortcuts,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const user = conversation.participants.find(
    (participant) => participant.id !== currentUser.id,
  ) as User;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    const isVisible = visibleShortcuts.some((s) => s.id === conversation.id);
    if (!isVisible) {
      onBack();
    }
  }, [visibleShortcuts, conversation.id, onBack]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const parseMessageDate = (message: MessageType): Date => {
    return new Date(message.sentAt);
  };

  const renderConversationStartBanner = () => {
    if (messages.length === 0) return null;
    return (
      <div className={styles.startBanner}>
        <div className={styles.startAvatar}>
          <img src={user.avatarUrl} alt={`${user.username} avatar`} />
        </div>
        <div className={styles.startContent}>
          <h3>
            Aquí comienza tu conversación con <strong>{user.username}</strong>
          </h3>
        </div>
      </div>
    );
  };

  const renderMessagesWithDateSeparators = () => {
    const messagesWithSeparators: React.ReactNode[] = [];
    let lastDate: string | null = null;

    messages.forEach((message: MessageType) => {
      const messageDate = parseMessageDate(message);
      const formattedDate = formatDate(messageDate);

      if (formattedDate !== lastDate) {
        messagesWithSeparators.push(
          <div key={`date-${formattedDate}`} className={styles.dateSeparator}>
            <div className={styles.separatorContent}>
              <span>{formattedDate}</span>
            </div>
          </div>,
        );
        lastDate = formattedDate;
      }

      messagesWithSeparators.push(
        <MessageComponent
          key={message.id}
          message={message}
          user={user}
          currentUser={currentUser}
        />,
      );
    });

    return messagesWithSeparators;
  };

  const renderWelcomeMessage = () => {
    if (messages.length > 0) return null;
    return (
      <div className={styles.welcomeMessage}>
        <div className={styles.welcomeIcon}>
          <CommentDotsIcon />
        </div>
        <h3>Este es el comienzo de tu conversación con {conversation.name}</h3>
        <button
          className={styles.icebreakerButton}
          onClick={() => {
            const icebreakers = ["Hello!"];
            const randomQuestion =
              icebreakers[Math.floor(Math.random() * icebreakers.length)];
            sendMessage(randomQuestion);
          }}
        >
          Say Hello
        </button>
      </div>
    );
  };

  return (
    <div className={styles.container} id="conversationContainer">
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.avatar}>
            <img
              id="conversationAvatar"
              src={conversation.avatarUrl}
              alt={`${conversation.name} avatar`}
            />
          </div>
          <div className={styles.name} id="conversationUserName">
            {conversation.name}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.profileBtn}`}
            title="View profile"
          >
            <UserIcon />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.callBtn}`}
            title="Voice call"
          >
            <PhoneIcon />
          </button>
        </div>
      </div>
      <div
        className={styles.messagesContainer}
        id="messagesList"
        ref={messagesContainerRef}
      >
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div className={`${styles.messageItem} ${styles.skeleton}`} key={i}>
              <div
                className={`${styles.messageAvatar} ${styles.skeleton}`}
              ></div>
              <div className={`${styles.messageContent} ${styles.skeleton}`}>
                <div className={`${styles.messageHeader} ${styles.skeleton}`}>
                  <span className={styles.messageUsername}></span>
                </div>
                <div
                  className={`${styles.messageBubble} ${styles.skeleton}`}
                ></div>
              </div>
            </div>
          ))
        ) : messages.length > 0 ? (
          <>
            {renderConversationStartBanner()}
            {renderMessagesWithDateSeparators()}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className={styles.noMessages}>{renderWelcomeMessage()}</div>
        )}
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ConversationChannel;
