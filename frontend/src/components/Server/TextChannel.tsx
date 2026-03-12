import React, { useEffect, useRef, useState, useCallback } from "react";
import MessageInput from "../Home/MessageInput";
import useMessages from "../../features/messages/useMessages";
import { HashtagIcon } from "../Icons";
import styles from "./TextChannel.module.css";
import type { Member } from "../../features/servers/serverTypes";
import type {
  Conversation,
  Message as MessageType,
} from "../../features/messages/conversationTypes";
import type { User } from "../../features/messages/conversationTypes";
import MessageComponent from "./MessageComponent";

interface TextChannelProps {
  conversationData: Conversation;
  currentUser: User;
  members: Member[];
  updateConversationMessages: (id: number, msgs: MessageType[]) => void;
  addMessageToConversation: (id: number, msg: MessageType) => void;
}

const TextChannel: React.FC<TextChannelProps> = ({
  conversationData,
  currentUser,
  members,
  updateConversationMessages,
  addMessageToConversation,
}) => {
  const { loading, sendMessage } = useMessages(
    conversationData,
    updateConversationMessages,
    addMessageToConversation
  );
  const messages = conversationData.messages;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef<number>(0);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (messagesContainerRef.current && shouldAutoScroll) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: behavior,
        });
      }
    },
    [shouldAutoScroll]
  );

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShouldAutoScroll(isNearBottom);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    const wasAtBottom = shouldAutoScroll;

    if (isInitialLoad) {
      requestAnimationFrame(() => {
        scrollToBottom("instant");
      });
      setIsInitialLoad(false);
    } else if (isNewMessage && wasAtBottom) {
      const newMessage = messages[messages.length - 1];
      const isCurrentUserMessage = newMessage.senderId === currentUser.id;

      requestAnimationFrame(() => {
        scrollToBottom(isCurrentUserMessage ? "smooth" : "auto");
      });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [
    messages,
    scrollToBottom,
    isInitialLoad,
    shouldAutoScroll,
    currentUser.id,
  ]);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, []);

  const parseMessageDate = useCallback((message: MessageType): Date => {
    return new Date(message.sentAt);
  }, []);

  const renderConversationStartBanner = useCallback(() => {
    return (
      <div className={styles.welcomeMessage}>
        <div className={styles.tcWelcomeIcon}>
          <i className="fas fa-door-open" />
        </div>
        <div className={styles.welcomeContent}>
          <h3>
            Welcome to <HashtagIcon />
            {conversationData.name}!
          </h3>
          <p>
            This is the start of the <HashtagIcon />
            {conversationData.name} channel.
          </p>
        </div>
      </div>
    );
  }, [conversationData.name]);

  const renderMessagesWithDateSeparators = useCallback(() => {
    const messagesWithSeparators: React.ReactNode[] = [];
    let lastDate: string | null = null;

    messages.forEach((message: MessageType) => {
      const messageDate = parseMessageDate(message);
      const formattedDate = formatDate(messageDate);

      if (formattedDate !== lastDate) {
        messagesWithSeparators.push(
          <div
            key={`date-${message.id}-${formattedDate}`}
            className={styles.dateSeparator}
          >
            <div className={styles.separatorContent}>
              <span>{formattedDate}</span>
            </div>
          </div>
        );
        lastDate = formattedDate;
      }

      messagesWithSeparators.push(
        <MessageComponent
          key={message.id}
          message={message}
          currentUser={currentUser}
          members={members}
        />
      );
    });

    return messagesWithSeparators;
  }, [messages, formatDate, parseMessageDate, currentUser, members]);

  return (
    <div className={styles.textChannel} id="conversationContainer">
      <div className={styles.textChannelHeader}>
        <HashtagIcon />
        <div className={styles.channelSelector} ref={dropdownRef}>
          <div className={styles.textChannelName} id="conversationUserName">
            {conversationData.name}
          </div>
        </div>
      </div>

      <div
        className={styles.messagesContainer}
        id="messagesList"
        ref={messagesContainerRef}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? (
          <div className={styles.skeletonContainer}>
            {[...Array(6)].map((_, i) => (
              <div className={styles.skeletonMessageItem} key={i}>
                <div className={styles.skeletonAvatar}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonHeader}></div>
                  <div className={styles.skeletonBubble}></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            {renderConversationStartBanner()}
            {renderMessagesWithDateSeparators()}
            <div
              ref={messagesEndRef}
              style={{ height: "1px", width: "100%" }}
            />
          </>
        ) : (
          <div className={styles.noMessages}>
            {renderConversationStartBanner()}
            <i className="fas fa-comment-slash"></i>
            <p>No messages in #{conversationData.name} yet</p>
            <button
              className={styles.startConversationBtn}
              onClick={() => {
                sendMessage("Hello!");
              }}
            >
              Say Hello
            </button>
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default TextChannel;
