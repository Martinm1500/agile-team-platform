// src/features/members/memberSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

import type { Member } from "../servers/serverTypes";

import {
  getMembersByServerIdRequest,
  kickMemberRequest,
  banMemberRequest,
} from "./memberService";

import { selectProjectsByServerId } from "../servers/serverSlice";
import { removeProjectMemberLocally } from "../servers/projectMemberSlice";
import type { RootState } from "../../store";

interface NormalizedMembersState {
  membersByServerId: Record<number, Record<number, Member>>;
  isLoadingMembers: boolean;
  membersError: string | null;
}

const initialState: NormalizedMembersState = {
  membersByServerId: {},
  isLoadingMembers: false,
  membersError: null,
};

export const getMembersByServerId = createAsyncThunk<
  Member[],
  number,
  { rejectValue: string }
>("members/getMembersByServerId", async (serverId, { rejectWithValue }) => {
  try {
    return await getMembersByServerIdRequest(serverId);
  } catch {
    return rejectWithValue("Error al obtener miembros");
  }
});

export const kickMember = createAsyncThunk<
  void,
  { serverId: number; userId: number },
  { rejectValue: string; state: RootState }
>("members/kickMember", async ({ serverId, userId }, thunkAPI) => {
  try {
    await kickMemberRequest(serverId, userId);
    const state = thunkAPI.getState();
    const projects = selectProjectsByServerId(state, serverId);

    projects.forEach((project) => {
      thunkAPI.dispatch(
        removeProjectMemberLocally({ projectId: project.id, userId })
      );
    });
  } catch {
    return thunkAPI.rejectWithValue("Error al kickear miembro");
  }
});

export const banMember = createAsyncThunk<
  void,
  { serverId: number; userId: number },
  { rejectValue: string; state: RootState }
>("members/banMember", async ({ serverId, userId }, thunkAPI) => {
  try {
    await banMemberRequest(serverId, userId);

    // Obtener los proyectos del servidor desde el estado
    const state = thunkAPI.getState();
    const projects = selectProjectsByServerId(state, serverId);

    // Eliminar localmente los ProjectMembers para cada proyecto
    projects.forEach((project) => {
      thunkAPI.dispatch(
        removeProjectMemberLocally({ projectId: project.id, userId })
      );
    });
  } catch {
    return thunkAPI.rejectWithValue("Error al banear miembro");
  }
});

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearError: (state) => {
      state.membersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMembersByServerId.pending, (state) => {
        state.isLoadingMembers = true;
        state.membersError = null;
      })
      .addCase(getMembersByServerId.fulfilled, (state, action) => {
        state.isLoadingMembers = false;

        const serverId = action.meta.arg;
        const membersMap: Record<number, Member> = action.payload.reduce(
          (acc, m) => {
            acc[m.userId] = m;
            return acc;
          },
          {} as Record<number, Member>
        );

        state.membersByServerId[serverId] = membersMap;
      })
      .addCase(getMembersByServerId.rejected, (state, action) => {
        state.isLoadingMembers = false;
        state.membersError = action.payload ?? "Error desconocido";
      })
      .addCase(kickMember.pending, (state) => {
        state.isLoadingMembers = true;
        state.membersError = null;
      })
      .addCase(kickMember.fulfilled, (state, action) => {
        state.isLoadingMembers = false;
        const { serverId, userId } = action.meta.arg;
        if (state.membersByServerId[serverId]) {
          delete state.membersByServerId[serverId][userId];
        }
      })
      .addCase(kickMember.rejected, (state, action) => {
        state.isLoadingMembers = false;
        state.membersError = action.payload ?? "Error desconocido";
      })
      .addCase(banMember.pending, (state) => {
        state.isLoadingMembers = true;
        state.membersError = null;
      })
      .addCase(banMember.fulfilled, (state, action) => {
        state.isLoadingMembers = false;
        const { serverId, userId } = action.meta.arg;
        if (state.membersByServerId[serverId]) {
          delete state.membersByServerId[serverId][userId];
        }
      })
      .addCase(banMember.rejected, (state, action) => {
        state.isLoadingMembers = false;
        state.membersError = action.payload ?? "Error desconocido";
      })
      // Nuevo: Reset en logout
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const selectMembersByServerId = createSelector(
  [
    (state: { members: NormalizedMembersState }) =>
      state.members.membersByServerId,
    (_: unknown, serverId: number) => serverId,
  ],
  (membersByServerId, serverId) => membersByServerId[serverId] ?? {}
);

export const selectAllMembersForServer = createSelector(
  [selectMembersByServerId],
  (membersMap) => Object.values(membersMap)
);

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;
