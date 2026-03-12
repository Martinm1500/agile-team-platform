import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

import type {
  NormalizedServersState,
  CreateServerRequest,
  UpdateServerRequest,
  Server,
  ServerFull,
  ServerBase,
  CreateProjectRequest,
  UpdateServerMemberRequest,
  Member,
  CreateChannelRequest,
  Channel,
  ServerInvitation,
  SendInvitationRequest,
  AcceptInvitationResponse,
  ProjectDTO,
  Project,
  JoinServerRequest,
} from "./serverTypes";

import {
  getServersRequest,
  getServerByIdRequest,
  createServerRequest,
  updateServerRequest,
  deleteServerRequest,
  createProjectRequest,
  deleteProjectRequest,
  updateServerMemberRequest,
  deleteChannelRequest,
  createChannelRequest,
  sendServerInvitationRequest,
  acceptServerInvitationRequest,
  rejectServerInvitationRequest,
  updateChannelRequest,
  updateProjectRequest,
  discoverServersRequest,
  joinServerRequest,
  requestJoinServerRequest,
  acceptJoinServerRequest,
  rejectJoinServerRequest,
  getOutgoingJoinServerRequest,
} from "./serverService";

import { normalizeServer, normalizeProject } from "./normalizeServer";

const initialState: NormalizedServersState = {
  serversById: {},
  owners: {},
  channels: {},
  roles: {},
  members: {},
  projects: {},

  isLoadingServers: false,
  isLoadingServerById: false,
  serversError: null,
  serverByIdError: null,
};

// Thunks
export const getServers = createAsyncThunk<
  Server[],
  void,
  { rejectValue: string }
>("server/getServers", async (_, { rejectWithValue }) => {
  try {
    return await getServersRequest();
  } catch {
    return rejectWithValue("Error al obtener servidores");
  }
});

export const getServerById = createAsyncThunk<
  ServerFull,
  number,
  { rejectValue: string }
>("server/getServerById", async (id, { rejectWithValue }) => {
  try {
    return await getServerByIdRequest(id);
  } catch {
    return rejectWithValue("Error al obtener servidor");
  }
});

export const createServer = createAsyncThunk<
  ServerFull,
  CreateServerRequest,
  { rejectValue: string }
>("server/createServer", async (data, { rejectWithValue }) => {
  try {
    return await createServerRequest(data);
  } catch {
    return rejectWithValue("Error al crear servidor");
  }
});

export const createChannel = createAsyncThunk<
  Channel,
  CreateChannelRequest,
  { rejectValue: string }
>("server/createChannel", async (data, { rejectWithValue }) => {
  try {
    return await createChannelRequest(data);
  } catch {
    return rejectWithValue("Error al crear canal");
  }
});

export const updateChannel = createAsyncThunk<
  Channel,
  { channelId: number; data: Channel },
  { rejectValue: string }
>("server/updateChannel", async ({ channelId, data }, { rejectWithValue }) => {
  try {
    return await updateChannelRequest(channelId, data);
  } catch {
    return rejectWithValue("Error al actualizar canal");
  }
});

export const updateServer = createAsyncThunk<
  Server,
  UpdateServerRequest,
  { rejectValue: string }
>("server/updateServer", async (data, { rejectWithValue }) => {
  try {
    return await updateServerRequest(data);
  } catch {
    return rejectWithValue("Error al actualizar servidor");
  }
});

export const deleteServer = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("server/deleteServer", async (id, { rejectWithValue }) => {
  try {
    await deleteServerRequest(id);
  } catch {
    return rejectWithValue("Error al eliminar servidor");
  }
});

export const deleteChannel = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("server/deleteChannel", async (id, { rejectWithValue }) => {
  try {
    await deleteChannelRequest(id);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar canal");
  }
});

export const createProject = createAsyncThunk<
  Project,
  { serverId: number; data: CreateProjectRequest },
  { rejectValue: string }
>("server/createProject", async ({ serverId, data }, { rejectWithValue }) => {
  try {
    return await createProjectRequest(serverId, data);
  } catch {
    return rejectWithValue("Error al crear proyecto");
  }
});

export const updateProject = createAsyncThunk<
  ProjectDTO,
  { projectId: number; data: ProjectDTO },
  { rejectValue: string }
>("server/updateProject", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    return await updateProjectRequest(projectId, data);
  } catch {
    return rejectWithValue("Error al actualizar proyecto");
  }
});

export const deleteProject = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("server/deleteProject", async (projectId, { rejectWithValue }) => {
  try {
    await deleteProjectRequest(projectId);
    return projectId;
  } catch {
    return rejectWithValue("Error al eliminar proyecto");
  }
});

export const updateServerMember = createAsyncThunk<
  Member,
  { serverId: number; data: UpdateServerMemberRequest },
  { rejectValue: string }
>(
  "server/updateServerMember",
  async ({ serverId, data }, { rejectWithValue }) => {
    try {
      return await updateServerMemberRequest(serverId, data);
    } catch {
      return rejectWithValue("Error al actualizar miembro del servidor");
    }
  }
);

export const sendServerInvitation = createAsyncThunk<
  ServerInvitation,
  { serverId: number; data: SendInvitationRequest },
  { rejectValue: string }
>(
  "server/sendServerInvitation",
  async ({ serverId, data }, { rejectWithValue }) => {
    try {
      return await sendServerInvitationRequest(serverId, data);
    } catch {
      return rejectWithValue("Error al enviar solicitud");
    }
  }
);

export const acceptServerInvitation = createAsyncThunk<
  AcceptInvitationResponse,
  { serverId: number; invitationId: number },
  { rejectValue: string }
>(
  "server/acceptServerInvitation",
  async ({ serverId, invitationId }, { rejectWithValue }) => {
    try {
      return await acceptServerInvitationRequest(serverId, invitationId);
    } catch {
      return rejectWithValue("Error al aceptar solicitud");
    }
  }
);

export const rejectServerInvitation = createAsyncThunk<
  void,
  { serverId: number; invitationId: number },
  { rejectValue: string }
>(
  "server/rejectServerInvitation",
  async ({ serverId, invitationId }, { rejectWithValue }) => {
    try {
      await rejectServerInvitationRequest(serverId, invitationId);
    } catch {
      return rejectWithValue("Error al rechazar solicitud");
    }
  }
);

export const discoverServers = createAsyncThunk<
  Server[],
  void,
  { rejectValue: string }
>("server/discoverServers", async (_, { rejectWithValue }) => {
  try {
    return await discoverServersRequest();
  } catch {
    return rejectWithValue("Error al obtener servidores públicos");
  }
});

export const joinServer = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("server/joinServer", async (serverId, { rejectWithValue }) => {
  try {
    await joinServerRequest(serverId);
  } catch {
    return rejectWithValue("Error al unirse al servidor");
  }
});

export const requestJoinServer = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("server/requestJoinServer", async (serverId, { rejectWithValue }) => {
  try {
    await requestJoinServerRequest(serverId);
  } catch {
    return rejectWithValue("Error al solicitar unirse al servidor");
  }
});

export const acceptJoinRequest = createAsyncThunk<
  void,
  { serverId: number; requestId: number },
  { rejectValue: string }
>(
  "server/acceptJoinRequest",
  async ({ serverId, requestId }, { rejectWithValue }) => {
    try {
      await acceptJoinServerRequest(serverId, requestId);
    } catch {
      return rejectWithValue("Error al aceptar solicitud de unión");
    }
  }
);

export const rejectJoinRequest = createAsyncThunk<
  void,
  { serverId: number; requestId: number },
  { rejectValue: string }
>(
  "server/rejectJoinRequest",
  async ({ serverId, requestId }, { rejectWithValue }) => {
    try {
      await rejectJoinServerRequest(serverId, requestId);
    } catch {
      return rejectWithValue("Error al rechazar solicitud de unión");
    }
  }
);

export const getOutgoingJoinRequests = createAsyncThunk<
  JoinServerRequest[],
  void,
  { rejectValue: string }
>("server/getOutgoingJoinRequests", async (_, { rejectWithValue }) => {
  try {
    return await getOutgoingJoinServerRequest();
  } catch {
    return rejectWithValue("Error al obtener solicitudes de unión enviadas");
  }
});

const serverSlice = createSlice({
  name: "server",
  initialState,
  reducers: {
    clearError: (state) => {
      state.serversError = null;
      state.serverByIdError = null;
    },
    removeServer: (state, action: PayloadAction<number>) => {
      const serverId = action.payload;
      // Elimina el servidor del diccionario
      delete state.serversById[serverId];

      // Opcional: Limpia referencias relacionadas (canales, roles, etc.) para evitar memory leaks
      // Puedes expandir esto si es necesario, pero para este caso basta con eliminar el servidor base
      Object.keys(state.channels).forEach((key) => {
        const idNum = Number(key);
        if (state.channels[idNum]?.serverId === serverId) {
          delete state.channels[idNum];
        }
      });
      Object.keys(state.roles).forEach((key) => {
        const idNum = Number(key);
        if (state.roles[idNum]?.serverId === serverId) {
          delete state.roles[idNum];
        }
      });
      Object.keys(state.members).forEach((key) => {
        const idNum = Number(key);
        if (state.members[idNum]?.serverId === serverId) {
          delete state.members[idNum];
        }
      });
      Object.keys(state.projects).forEach((key) => {
        const idNum = Number(key);
        if (state.projects[idNum]?.serverId === serverId) {
          delete state.projects[idNum];
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // GET SERVERS (solo id + name + avatarUrl)
      .addCase(getServers.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(getServers.fulfilled, (state, action) => {
        state.isLoadingServers = false;
        action.payload.forEach((dto) => {
          const base: ServerBase = {
            id: dto.id,
            name: dto.name,
            avatarUrl: dto.avatarUrl,
            createdAt: "",
            ownerId: 0,
            channelIds: [],
            roleIds: [],
            memberIds: [],
            projectIds: [],
            bannerUrl: dto.bannerUrl ?? "",
            description: dto.description ?? "",
            privacy: dto.privacy,
          };
          state.serversById[dto.id] = base;
        });
      })
      .addCase(getServers.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // GET Full SERVER BY ID (normalized)
      .addCase(getServerById.pending, (state) => {
        state.isLoadingServerById = true;
        state.serverByIdError = null;
      })
      .addCase(getServerById.fulfilled, (state, action) => {
        state.isLoadingServerById = false;
        const normalized = normalizeServer(action.payload);

        Object.assign(state.serversById, normalized.serversById);
        Object.assign(state.owners, normalized.owners);
        Object.assign(state.channels, normalized.channels);
        Object.assign(state.roles, normalized.roles);
        Object.assign(state.members, normalized.members);
        Object.assign(state.projects, normalized.projects);
      })
      .addCase(getServerById.rejected, (state, action) => {
        state.isLoadingServerById = false;
        state.serverByIdError = action.payload ?? "Error desconocido";
      })

      // CREATE SERVER (normalized)
      .addCase(createServer.pending, (state) => {
        state.isLoadingServers = true;
      })
      .addCase(createServer.fulfilled, (state, action) => {
        state.isLoadingServers = false;
        const normalized = normalizeServer(action.payload);

        Object.assign(state.serversById, normalized.serversById);
        Object.assign(state.owners, normalized.owners);
        Object.assign(state.channels, normalized.channels);
        Object.assign(state.roles, normalized.roles);
        Object.assign(state.members, normalized.members);
        Object.assign(state.projects, normalized.projects);
      })
      .addCase(createServer.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // CREATE CHANNEL
      .addCase(createChannel.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.isLoadingServers = false;
        const channel = action.payload;
        state.channels[channel.id] = channel;

        const server = state.serversById[channel.serverId];
        if (server && !server.channelIds.includes(channel.id)) {
          server.channelIds.push(channel.id);
        }
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // UPDATE CHANNEL
      .addCase(updateChannel.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.isLoadingServers = false;
        const updatedChannel = action.payload;
        if (state.channels[updatedChannel.id]) {
          state.channels[updatedChannel.id] = updatedChannel;
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // UPDATE SERVER (solo actualiza el nombre)
      .addCase(updateServer.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.serversById[updated.id]) {
          state.serversById[updated.id].name = updated.name;
          state.serversById[updated.id].avatarUrl = updated.avatarUrl;
          state.serversById[updated.id].bannerUrl = updated.bannerUrl ?? "";
          state.serversById[updated.id].description = updated.description ?? "";
          state.serversById[updated.id].privacy = updated.privacy;
        }
      })

      // CREATE PROJECT
      .addCase(createProject.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoadingServers = false;

        const server = state.serversById[action.meta.arg.serverId];

        if (server) {
          if (!server.projectIds.includes(action.payload.id)) {
            server.projectIds.push(action.payload.id);
          }

          const newChannels = action.payload.channels || [];
          newChannels.forEach((channel) => {
            if (!server.channelIds.includes(channel.id)) {
              server.channelIds.push(channel.id);
            }
          });
        }

        const normalized = normalizeProject(
          action.payload,
          action.meta.arg.serverId
        );
        Object.assign(state.projects, normalized.projects ?? {});
        Object.assign(state.channels, normalized.channels ?? {});
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // UPDATE PROJECT
      .addCase(updateProject.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoadingServers = false;
        const payload = action.payload;
        const project = state.projects[payload.id];
        if (project) {
          const oldKanban = project.kanban;
          const oldSmartNotes = project.smartNotes;
          project.name = payload.name;
          project.kanban = payload.hasKanban;
          project.smartNotes = payload.hasNotes;
          if (oldKanban && !payload.hasKanban) {
            project.kanbanWorkspaceId = undefined;
          }
          if (oldSmartNotes && !payload.hasNotes) {
            project.smartNotesWorkspaceId = undefined;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // DELETE PROJECT
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.payload;

        // 1. Eliminar del diccionario
        delete state.projects[projectId];

        // 2. Eliminar referencias en channels y projectMembers
        Object.keys(state.channels).forEach((key) => {
          const idNum = Number(key);
          const channel = state.channels[idNum];
          if (channel && channel.projectId === projectId) {
            delete state.channels[idNum];
          }
        });

        // 3. Sacarlo de todos los servidores
        Object.values(state.serversById).forEach((server) => {
          server.projectIds = server.projectIds.filter(
            (id) => id !== projectId
          );
        });
      })

      // DELETE CHANNEL
      .addCase(deleteChannel.fulfilled, (state, action) => {
        const channelId = action.payload;

        // 1. Eliminar del diccionario de canales
        delete state.channels[channelId];

        // 2. Eliminar referencia de los servidores
        Object.values(state.serversById).forEach((server) => {
          server.channelIds = server.channelIds.filter(
            (id) => id !== channelId
          );
        });
      })

      // DELETE SERVER
      .addCase(deleteServer.fulfilled, (state, action) => {
        const id = action.meta.arg;
        delete state.serversById[id];
      })

      // UPDATE SERVER MEMBER
      .addCase(updateServerMember.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(updateServerMember.fulfilled, (state, action) => {
        state.isLoadingServers = false;

        const updatedMember = action.payload;
        const { userId, serverId } = updatedMember;

        // 1. Guardamos el miembro actualizado en el diccionario global
        state.members[userId] = updatedMember;

        // 2. Agregar el miembro al servidor si todavía no está
        const server = state.serversById[serverId];
        if (server && !server.memberIds.includes(userId)) {
          server.memberIds.push(userId);
        }
      })
      .addCase(updateServerMember.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // SEND SERVER INVITATION
      .addCase(sendServerInvitation.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(sendServerInvitation.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(sendServerInvitation.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // ACCEPT SERVER INVITATION
      .addCase(acceptServerInvitation.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(acceptServerInvitation.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(acceptServerInvitation.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // REJECT SERVER INVITATION
      .addCase(rejectServerInvitation.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(rejectServerInvitation.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(rejectServerInvitation.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // JOIN SERVER
      .addCase(joinServer.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(joinServer.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(joinServer.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // REQUEST JOIN SERVER
      .addCase(requestJoinServer.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(requestJoinServer.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(requestJoinServer.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // ACCEPT JOIN REQUEST
      .addCase(acceptJoinRequest.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(acceptJoinRequest.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(acceptJoinRequest.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // REJECT JOIN REQUEST
      .addCase(rejectJoinRequest.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(rejectJoinRequest.fulfilled, (state) => {
        state.isLoadingServers = false;
      })
      .addCase(rejectJoinRequest.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // GET OUTGOING JOIN REQUESTS
      .addCase(getOutgoingJoinRequests.pending, (state) => {
        state.isLoadingServers = true;
        state.serversError = null;
      })
      .addCase(getOutgoingJoinRequests.rejected, (state, action) => {
        state.isLoadingServers = false;
        state.serversError = action.payload ?? "Error desconocido";
      })

      // Nuevo: Reset en logout
      .addCase(logout.fulfilled, () => initialState)

      .addCase(removeServer, (_state, action) => {
        console.log(`Servidor ${action.payload} removido del estado`);
      });
  },
});

// Selectores básicos (mantener solo los necesarios)
export const selectServersById = (state: { servers: NormalizedServersState }) =>
  state.servers.serversById;

export const selectServerById = createSelector(
  [selectServersById, (_: unknown, id: number) => id],
  (serversById, id) => serversById[id] ?? null
);

export const selectAllServers = createSelector(
  [selectServersById],
  (serversById) => Object.values(serversById)
);

// Selectores para owners
export const selectOwners = (state: { servers: NormalizedServersState }) =>
  state.servers.owners;

export const selectOwnerById = createSelector(
  [selectOwners, (_: unknown, id: number) => id],
  (ownersById, id) => ownersById[id] ?? null
);

// Selectores para roles
export const selectRoles = (state: { servers: NormalizedServersState }) =>
  state.servers.roles;

export const selectRolesByServerId = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.roles,
    (_: unknown, serverId: number) => serverId,
  ],
  (rolesById, serverId) =>
    Object.values(rolesById).filter((role) => role.serverId === serverId)
);

export const selectServerRoles = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.roles,
    (state: { servers: NormalizedServersState }) => state.servers.serversById,
    (_: unknown, serverId: number) => serverId,
  ],
  (rolesById, serversById, serverId) => {
    const server = serversById[serverId];
    if (!server) return [];
    return server.roleIds.map((id) => rolesById[id]).filter(Boolean);
  }
);

// Selectores para miembros
export const selectMembers = (state: { servers: NormalizedServersState }) =>
  state.servers.members;

export const selectMemberById = createSelector(
  [selectMembers, (_: unknown, userId: number) => userId],
  (membersById, userId) => membersById[userId] ?? null
);

export const selectMembersByServerId = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.members,
    (state: { servers: NormalizedServersState }) => state.servers.serversById,
    (_: unknown, serverId: number) => serverId,
  ],
  (membersById, serversById, serverId) => {
    const server = serversById[serverId];
    if (!server) return [];
    return server.memberIds.map((id) => membersById[id]).filter(Boolean);
  }
);

// Selectores para canales
export const selectChannels = (state: { servers: NormalizedServersState }) =>
  state.servers.channels;

export const selectChannelsByServerId = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.channels,
    (state: { servers: NormalizedServersState }) => state.servers.serversById,
    (_: unknown, serverId: number) => serverId,
  ],
  (channelsById, serversById, serverId) => {
    const server = serversById[serverId];
    return server
      ? server.channelIds.map((id) => channelsById[id]).filter(Boolean)
      : [];
  }
);

export const selectChannelById = createSelector(
  [selectChannels, (_: unknown, id: number) => id],
  (channelsById, id) => channelsById[id] ?? null
);

// Selectores para proyectos
export const selectProjects = (state: { servers: NormalizedServersState }) =>
  state.servers.projects;

export const selectProjectById = createSelector(
  [selectProjects, (_: unknown, id: number) => id],
  (projectsById, id) => projectsById[id] ?? null
);

export const selectProjectsByServerId = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.projects,
    (state: { servers: NormalizedServersState }) => state.servers.serversById,
    (_: unknown, serverId: number) => serverId,
  ],
  (projectsById, serversById, serverId) => {
    const server = serversById[serverId];
    if (!server) return [];

    return server.projectIds.map((id) => projectsById[id]).filter(Boolean);
  }
);

// Selector combinado para relaciones complejas
export const selectProjectChannels = createSelector(
  [
    (state: { servers: NormalizedServersState }) => state.servers.channels,
    selectProjectById,
  ],
  (channelsById, project) => {
    if (!project) return { textChannel: null, voiceChannel: null };

    return {
      textChannel: project.textChannelId
        ? channelsById[project.textChannelId]
        : null,
      voiceChannel: project.voiceChannelId
        ? channelsById[project.voiceChannelId]
        : null,
    };
  }
);

// Selector para obtener un servidor completo con todas sus relaciones
export const selectFullServerById = createSelector(
  [
    selectServerById,
    selectOwnerById,
    selectChannelsByServerId,
    selectServerRoles,
    selectMembersByServerId,
    selectProjectsByServerId,
  ],
  (server, owner, channels, roles, members, projects) => {
    if (!server) return null;

    return {
      ...server,
      owner,
      channels,
      roles,
      members,
      projects,
    };
  }
);

// Selectores de estado de loading y error
export const selectIsLoadingServers = (state: {
  servers: NormalizedServersState;
}) => state.servers.isLoadingServers;

export const selectIsLoadingServerById = (state: {
  servers: NormalizedServersState;
}) => state.servers.isLoadingServerById;

export const selectServersError = (state: {
  servers: NormalizedServersState;
}) => state.servers.serversError;

export const selectServerByIdError = (state: {
  servers: NormalizedServersState;
}) => state.servers.serverByIdError;

export const { clearError, removeServer } = serverSlice.actions;
export default serverSlice.reducer;
