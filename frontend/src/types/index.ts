import type { Server } from "../features/servers/serverTypes";

export interface ServerViewProps {
  currentUser: User;
  isActivitySidebarVisible: boolean;
  server: Server;
}

export type SidePanelView = "active-members" | "tasks" | "server-members";
export type MainView = "text" | "project-members" | "events" | "threads";

export interface User {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface Contact {
  id: number;
  requester: User;
  target: User;
  blockedBy: User;
  requestedAt: string;
  acceptedAt: string;
  status: ContactStatus;
}

export type ContactStatus =
  | "PENDING"
  | "ACCEPTED"
  | "BLOCKED"
  | "REJECTED"
  | "UNBLOCKED";

export interface Project {
  id: number;
  ownerId: number;
  serverId: number;
  name: string;
  kanban: boolean;
  smartNotes: boolean;
  textChannelId: number | undefined;
  voiceChannelId: number | undefined;
  kanbanWorkspaceId: number | undefined;
  smartNotesWorkspaceId: number | undefined;
}

export interface Specialty {
  id: number;
  projectId: number;
  name: string;
  description: string;
  createTask: boolean;
  editTask: boolean;
  deleteTask: boolean;
  moveTask: boolean;
  assignTask: boolean;
  manageColumns: boolean;
  createNote: boolean;
  editNote: boolean;
  deleteNote: boolean;
  moveNote: boolean;
  lockNote: boolean;
  manageCategories: boolean;
}

export interface TextChannel {
  id: number;
  name: string;
  conversation: Conversation | null;
  serverId: number;
  projectId: number | null;
  type: ChannelType;
}

export interface VoiceChannel {
  id: number;
  name: string;
  conversation: Conversation | null;
  serverId: string;
  projectId: number | null;
  type: ChannelType;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  relatedId?: number;
  relatedServerId?: number;
  relatedProjectId?: number;
  isRead: boolean;
  type: NotificationType;
  createdAt: string;
}

export type NotificationType =
  | "SERVER_INVITATION"
  | "PROJECT_INVITATION"
  | "CONTACT_INVITATION"
  | "REQUEST_TO_JOIN"
  | "CONTACT_INVITATION_ACCEPTED"
  | "CONTACT_REMOVED"
  | "SERVER_MEMBER_REMOVED"
  | "PROJECT_MEMBER_REMOVED"
  | "SERVER_INVITATION_ACCEPTED"
  | "PROJECT_INVITATION_ACCEPTED";

export interface Role {
  id: number;
  serverId: number;
  name: string;
  description: string | null;
  manageChannels: boolean;
  manageMembers: boolean;
  manageRoles: boolean;
  sendMessages: boolean;
  manageServers: boolean;
  manageProjects: boolean;
}

export interface Message {
  id: string;
  senderId: number;
  text: string;
  created_at?: string | Date;
}

export interface Task {
  id: number;
  kanbanId: number;
  title: string;
  description: string;
  columnId: number;
  assigneeId?: number | null;
  creatorUserId?: number | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate: string;
}

export interface ConversationCache {
  [key: string]: Message[];
}

export interface Conversation {
  id: number;
  channelId: number;
  name: string;
  avatarUrl: string;
  participants: User[];
  messages: Message[];
}

export type ConversationMap = {
  [key: `conv_${number}`]: Conversation;
};

export interface ProjectOptions {
  kanban: boolean;
  smartNotes: boolean;
}

// Smart Notes Interfaces
export interface SmartNotesWorkspace {
  id: number;
  projectId: number;
  title: string;
  notes: (Note | EmptyNote | IndicatorNote)[];
}

export interface Note {
  id: number;
  title: string;
  type: string;
  content: string;
  summary: string;
  tags: string[];
  sourceLinks: string[];
  insights: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  noteColor: string;
  visibility: string;
}

export interface EmptyNote {
  id: number;
  type: "empty";
}

export interface IndicatorNote {
  id: number;
  type: "indicator";
}

export type DisplayNote = Note | EmptyNote | IndicatorNote;

// Kanban Interfaces
export interface KanbanWorkspace {
  id: number;
  projectId: number;
  title: string;
  tasks: Task[];
}

// Interfaces extendidas para relaciones consolidadas
export interface ProjectWithWorkspaces extends Project {
  kanbanWorkspace?: KanbanWorkspace;
  smartNotesWorkspace?: SmartNotesWorkspace;
}

export interface ServerWithWorkspaces extends Omit<Server, "Projects"> {
  Projects: ProjectWithWorkspaces[];
}

// Interfaces para props de componentes
export interface GeneralViewProps {
  tasks: Task[];
  sendMessage: (text: string) => void;
  isActivitySidebarVisible: boolean;
  server: Server;
  setServer: React.Dispatch<React.SetStateAction<Server>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

// Interfaces para modales y estados
export interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channelId: number, name: string, isPrivate: boolean) => void;
  onDelete: (channelId: number) => void;
  channel: TextChannel | VoiceChannel | null;
  canManageChannels: boolean;
}

export interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: number, name: string, isPrivate: boolean) => void;
  onDelete: (projectId: number) => void;
  project: Project | null;
  canManageProjects: boolean;
}

export interface VoiceChannelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentChannelName: string;
  newChannelName: string;
}

// Interfaces para hooks

// Interfaces para funciones de utilidad
export interface WorkspaceRelations {
  projectId: number;
  kanbanWorkspaceId?: number;
  smartNotesWorkspaceId?: number;
}

export interface ProjectCreationData {
  name: string;
  options: ProjectOptions;
  createdBy: number;
  serverId: number;
}

// Type guards
export function isTextChannel(
  channel: TextChannel | VoiceChannel,
): channel is TextChannel {
  return "conversation" in channel;
}

export function isVoiceChannel(
  channel: TextChannel | VoiceChannel,
): channel is VoiceChannel {
  return !("conversation" in channel);
}

export function isNote(note: DisplayNote): note is Note {
  return note.type !== "empty" && note.type !== "indicator";
}

export function isEmptyNote(note: DisplayNote): note is EmptyNote {
  return note.type === "empty";
}

export function isIndicatorNote(note: DisplayNote): note is IndicatorNote {
  return note.type === "indicator";
}

// Enums para mejor tipado
export type ChannelType = "TEXT" | "VOICE";

export type ProjectTool = "kanban" | "smartNotes";

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type MemberRole = "Admin" | "Moderator" | "Member";
