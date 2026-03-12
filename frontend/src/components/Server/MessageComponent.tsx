import React from "react";
import "../Home/Message.css";
import type { Message, User } from "../../features/messages/conversationTypes";
import type { Member as ServerMember } from "../../features/servers/serverTypes";

export interface MessageProps {
  message: Message;
  currentUser: User;
  members: ServerMember[];
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  currentUser,
  members,
}) => {
  const isCurrentUser = message.senderId === currentUser.id;
  const senderMember = members.find((m) => m.userId === message.senderId);
  const sender = {
    id: message.senderId,
    name: isCurrentUser ? currentUser.name : message.senderUsername,
    avatarUrl: isCurrentUser
      ? currentUser.avatarUrl
      : senderMember?.avatarUrl || "https://i.pravatar.cc/150?img=1",
  };
  const timestamp = new Date(message.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="message-item">
      <div className="message-avatar">
        <img src={sender.avatarUrl} alt={sender.name} />
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-username">{sender.name}</span>
          <span className="message-timestamp">{timestamp}</span>
        </div>
        <div className="message-bubble">{message.content}</div>
      </div>
    </div>
  );
};

export default MessageComponent;
