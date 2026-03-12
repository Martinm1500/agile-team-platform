// conversationTypes.ts
export interface User {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  channelId?: number | null;
  contactId?: number | null;
  sentAt: string;
}

export interface Conversation {
  id: number;
  channelId: number | null;
  contactId: number | null;
  name: string;
  avatarUrl: string;
  type: "dm" | "channel";
  participants: User[];
  messages: Message[];
  initialized: boolean;
}

export interface Shortcut {
  id: number;
  otherUserId: number;
  name: string;
  avatarUrl: string;
  unread: boolean;
}

export interface ConversationDTO {
  id: number;
  type: "dm" | "channel";
  contactId: number;
  channelId: number;
}

export interface IncomingMessageNotification {
  contactId: number;
  senderId: number;
  conversationId?: number;
}

export interface ConversationStatus {
  conversationId: number;
  contactId: number;
  otherUser: User;
  hasUnread: boolean;
}
