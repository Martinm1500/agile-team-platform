// src/features/servers/projectMemberSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";
import type {
  ProjectMember,
  UpdateProjectMemberRequest,
  SendInvitationRequest,
} from "./serverTypes";
import {
  acceptProjectInvitationRequest,
  getProjectMembersByProjectIdRequest,
  rejectProjectInvitationRequest,
  removeProjectMemberRequest,
  sendProjectInvitationRequest,
  updateProjectMemberRequest,
} from "./projectService";

interface ProjectMembersState {
  projectMembers: Record<string, ProjectMember>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectMembersState = {
  projectMembers: {},
  isLoading: false,
  error: null,
};

// Thunks
export const updateProjectMember = createAsyncThunk<
  ProjectMember,
  UpdateProjectMemberRequest,
  { rejectValue: string }
>("projectMember/updateProjectMember", async (data, { rejectWithValue }) => {
  try {
    return await updateProjectMemberRequest(data.projectId, data);
  } catch {
    return rejectWithValue("Error al actualizar miembro de proyecto");
  }
});

export const sendProjectInvitation = createAsyncThunk<
  void,
  { projectId: number; data: SendInvitationRequest },
  { rejectValue: string }
>(
  "projectMember/sendProjectInvitation",
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      await sendProjectInvitationRequest(projectId, data);
    } catch {
      return rejectWithValue("Error al enviar invitación al proyecto");
    }
  }
);

export const acceptProjectInvitation = createAsyncThunk<
  void,
  { projectId: number; invitationId: number },
  { rejectValue: string }
>(
  "projectMember/acceptProjectInvitation",
  async ({ projectId, invitationId }, { rejectWithValue }) => {
    try {
      await acceptProjectInvitationRequest(projectId, invitationId);
    } catch {
      return rejectWithValue("Error al aceptar invitación al proyecto");
    }
  }
);

export const rejectProjectInvitation = createAsyncThunk<
  void,
  { projectId: number; invitationId: number },
  { rejectValue: string }
>(
  "projectMember/rejectProjectInvitation",
  async ({ projectId, invitationId }, { rejectWithValue }) => {
    try {
      await rejectProjectInvitationRequest(projectId, invitationId);
    } catch {
      return rejectWithValue("Error al rechazar invitación al proyecto");
    }
  }
);

export const removeProjectMember = createAsyncThunk<
  { projectId: number; userId: number },
  { projectId: number; userId: number },
  { rejectValue: string }
>(
  "projectMember/removeProjectMember",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      await removeProjectMemberRequest(projectId, userId);
      return { projectId, userId };
    } catch {
      return rejectWithValue("Error al remover miembro del proyecto");
    }
  }
);

export const getProjectMembers = createAsyncThunk<
  ProjectMember[],
  number,
  { rejectValue: string }
>("projectMember/getProjectMembers", async (projectId, { rejectWithValue }) => {
  try {
    return await getProjectMembersByProjectIdRequest(projectId);
  } catch {
    return rejectWithValue("Error al obtener miembros del proyecto");
  }
});

const projectMemberSlice = createSlice({
  name: "projectMembers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    removeProjectMemberLocally: (state, action) => {
      const { projectId, userId } = action.payload;
      const key = `${projectId}_${userId}`;
      delete state.projectMembers[key];
    },
  },
  extraReducers: (builder) => {
    builder
      // UPDATE PROJECT MEMBER
      .addCase(updateProjectMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProjectMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const key = `${updated.projectId}_${updated.userId}`;
        state.projectMembers[key] = updated;
      })
      .addCase(updateProjectMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // GET PROJECT MEMBERS
      .addCase(getProjectMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const projectId = action.meta.arg;
        action.payload.forEach((pm) => {
          const key = `${projectId}_${pm.userId}`;
          state.projectMembers[key] = {
            ...pm,
            projectId,
          };
        });
      })
      .addCase(getProjectMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // SEND PROJECT INVITATION
      .addCase(sendProjectInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendProjectInvitation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendProjectInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // ACCEPT PROJECT INVITATION
      .addCase(acceptProjectInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptProjectInvitation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(acceptProjectInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // REJECT PROJECT INVITATION
      .addCase(rejectProjectInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectProjectInvitation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(rejectProjectInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // REMOVE PROJECT MEMBER
      .addCase(removeProjectMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const { projectId, userId } = action.payload;
        const key = `${projectId}_${userId}`;
        delete state.projectMembers[key];
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })

      // Nuevo: Reset en logout
      .addCase(logout.fulfilled, () => initialState);
  },
});

// Selectores
export const selectProjectMembers = (state: {
  projectMember: ProjectMembersState;
}) => state.projectMember.projectMembers;

export const selectProjectMembersByProjectId = createSelector(
  [selectProjectMembers, (_: unknown, projectId: number) => projectId],
  (projectMembers, projectId) =>
    Object.values(projectMembers).filter((pm) => pm.projectId === projectId)
);

export const selectIsLoadingProjectMembers = (state: {
  projectMembers: ProjectMembersState;
}) => state.projectMembers.isLoading;

export const selectProjectMembersError = (state: {
  projectMembers: ProjectMembersState;
}) => state.projectMembers.error;

export const { clearError, removeProjectMemberLocally } =
  projectMemberSlice.actions;
export default projectMemberSlice.reducer;
