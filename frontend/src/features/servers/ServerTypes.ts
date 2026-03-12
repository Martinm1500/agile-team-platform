// src/features/server/serverTypes.ts
export interface Owner {
  id: number;
  username: string;
  avatarUrl: string | null;
}

export type ChannelType = "TEXT" | "VOICE";

export interface Channel {
  id: number;
  serverId: number;
  projectId: number | null;
  name: string;
  type: ChannelType;
}

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

export interface Member {
  serverId: number;
  userId: number;
  roleId: number;
  username: string;
  avatarUrl: string | null;
  status: string;
  joinDate: string;
}

export interface UseVoiceReturn {
  currentChannelId: number | null;
  connectedUsers: { [channelId: number]: Member[] };
  joinVoiceChannel: (channelId: number, member: Member) => void;
  leaveVoiceChannel: (userId: number) => void;
  leaveAllVoiceChannels: (userId: number) => void;
}

export interface MemberDetailsProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (memberId: number) => void;
  onKick: (memberId: number) => void;
  onAssignRole: (memberId: number, role: string) => void;
  roles: Role[];
}

export interface Channel {
  id: number;
  serverId: number;
  projectId: number | null;
  name: string;
  type: ChannelType;
}

export interface ProjectCreator {
  projectId: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
}

export interface NotesWorkspace {
  id: number;
  projectId: number;
  name: string;
}

export interface KanbanWorkspace {
  id: number;
  projectId: number;
  name: string;
  columnDTOS: null;
}

export interface ProjectMember {
  projectId: number;
  userId: number;
  specialtyId: number;
  username: string;
  avatarUrl: string | null;
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

//Respuesta del servidor
export interface Project {
  id: number;
  name: string;
  projectCreator: ProjectCreator;
  projectMembers: ProjectMember[];
  specialties: Specialty[];
  channels: Channel[];
  kanbanWorkspace: KanbanWorkspace | undefined;
  notesWorkspace: NotesWorkspace | undefined;
}

export interface ProjectDTO {
  id: number;
  serverId: number;
  creatorId: number;
  name: string;
  hasKanban: boolean;
  hasNotes: boolean;
}

export interface ProjectBase {
  id: number;
  serverId: number;
  ownerId: number;
  name: string;
  kanban: boolean;
  smartNotes: boolean;
  textChannelId: number | undefined;
  voiceChannelId: number | undefined;
  kanbanWorkspaceId: number | undefined;
  smartNotesWorkspaceId: number | undefined;
}

export interface ServerFull {
  id: number;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  privacy: string;
  createdAt: string;
  owner: Owner;
  channels: Channel[];
  roles: Role[];
  members: Member[];
  projects: Project[];
}

export interface Server {
  id: number;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  privacy: string;
  membersCount?: number;
}

export interface ServerBase {
  id: number;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  privacy: string;
  createdAt: string;
  ownerId: number;
  channelIds: number[];
  roleIds: number[];
  memberIds: number[];
  projectIds: number[];
}

export interface ServerInvitation {
  id: number;
  serverId: number;
  invitedUserId: number;
  senderUserId: number;
  status: InvitationStatus;
  createdAt: string;
}

export interface JoinServerRequest {
  id: number;
  serverId: number;
  requesterId: number;
  status: InvitationStatus;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface NormalizedServersState {
  serversById: Record<number, ServerBase>;
  owners: Record<number, Owner>;
  channels: Record<number, Channel>;
  roles: Record<number, Role>;
  members: Record<number, Member>;
  projects: Record<number, ProjectBase>;

  isLoadingServers: boolean;
  isLoadingServerById: boolean;
  serversError: string | null;
  serverByIdError: string | null;
}

export interface CreateServerRequest {
  name: string;
}

export interface UpdateServerRequest {
  id: number;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  privacy: string;
}

export interface CreateProjectRequest {
  serverId: number;
  name: string;
  hasKanban: boolean;
  hasNotes: boolean;
}

export interface UpdateProjectMemberRequest {
  projectId: number;
  userId: number;
  specialtyId: number;
}

export interface UpdateServerMemberRequest {
  serverId: number;
  userId: number;
  roleId: number;
}

export interface CreateChannelRequest {
  serverId: number;
  name: string;
  type: ChannelType;
}

export interface SendInvitationRequest {
  userId: number;
}

export interface AcceptInvitationResponse {
  serverId: number;
}
