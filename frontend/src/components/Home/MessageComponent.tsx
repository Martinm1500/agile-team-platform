import React from "react";
import type { Message, User } from "../../features/messages/conversationTypes";
import "../Home/Message.css";

interface MessageProps {
  message: Message;
  user: User;
  currentUser: User;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  user,
  currentUser,
}) => {
  const isCurrentUser = String(message.senderId) === String(currentUser.id);
  const sender = isCurrentUser ? currentUser : user;
  const timestamp = "12:30 PM";

  return (
    <div className="message-item">
      <div className="message-avatar">
        <img src={sender.avatarUrl} alt={sender.username} />
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-username">{sender.username}</span>
          <span className="message-timestamp">{timestamp}</span>
        </div>
        <div className="message-bubble">{message.content}</div>
      </div>
    </div>
  );
};

export default MessageComponent;
