// src/features/server/normalizeServer.ts
import type {
  NormalizedServersState,
  ServerFull,
  ServerBase,
  ProjectBase,
  Project,
} from "./serverTypes";

export function normalizeServer(
  dto: ServerFull
): Partial<NormalizedServersState> {
  const serverBase: ServerBase = {
    id: dto.id,
    name: dto.name,
    avatarUrl: dto.avatarUrl ?? "",
    createdAt: dto.createdAt,
    ownerId: dto.owner.id,
    channelIds: dto.channels.map((c) => c.id),
    roleIds: dto.roles.map((r) => r.id),
    memberIds: dto.members.map((m) => m.userId),
    projectIds: dto.projects.map((p) => p.id),
    bannerUrl: dto.bannerUrl ?? "",
    description: dto.description ?? "",
    privacy: dto.privacy,
  };

  const normalized: Partial<NormalizedServersState> = {
    serversById: { [dto.id]: serverBase },
    owners: { [dto.owner.id]: dto.owner },
    channels: {},
    roles: {},
    members: {},
    projects: {},
  };

  dto.channels.forEach((c) => (normalized.channels![c.id] = c));
  dto.roles.forEach((r) => (normalized.roles![r.id] = r));
  dto.members.forEach((m) => (normalized.members![m.userId] = m));

  dto.projects.forEach((p) => {
    p.channels.forEach((c) => {
      normalized.channels![c.id] = {
        ...c,
        serverId: dto.id,
        projectId: p.id,
      };
    });

    const textChannel = p.channels.find((c) => c.type === "TEXT");
    const voiceChannel = p.channels.find((c) => c.type === "VOICE");

    const projectBase: ProjectBase = {
      id: p.id,
      serverId: dto.id,
      ownerId: dto.owner.id,
      name: p.name,
      kanban: !!p.kanbanWorkspace,
      smartNotes: !!p.notesWorkspace,
      textChannelId: textChannel?.id,
      voiceChannelId: voiceChannel?.id,
      kanbanWorkspaceId: p.kanbanWorkspace?.id,
      smartNotesWorkspaceId: p.notesWorkspace?.id,
    };

    normalized.projects![p.id] = projectBase;
  });

  return normalized;
}

export function normalizeProject(
  project: Project,
  serverId: number
): Partial<NormalizedServersState> {
  const channels = project.channels ?? [];
  const textChannel = channels.find((c) => c.type === "TEXT");
  const voiceChannel = channels.find((c) => c.type === "VOICE");

  const projectBase: ProjectBase = {
    id: project.id,
    serverId,
    ownerId: project.projectCreator.userId,
    name: project.name,
    kanban: !!project.kanbanWorkspace,
    smartNotes: !!project.notesWorkspace,
    textChannelId: textChannel?.id,
    voiceChannelId: voiceChannel?.id,
    kanbanWorkspaceId: project.kanbanWorkspace?.id ?? undefined,
    smartNotesWorkspaceId: project.notesWorkspace?.id ?? undefined,
  };

  const normalized: Partial<NormalizedServersState> = {
    projects: { [project.id]: projectBase },
    channels: {},
  };

  channels.forEach((channel) => {
    normalized.channels![channel.id] = {
      ...channel,
      serverId,
      projectId: project.id,
    };
  });

  return normalized;
}
