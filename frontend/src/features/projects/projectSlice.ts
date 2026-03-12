// src/features/project/projectSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Project } from "../servers/serverTypes";
import {
  getProjectsRequest,
  getProjectsByServerRequest,
  getProjectByIdRequest,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
} from "./projectService";

export interface ProjectState {
  projectsById: Record<number, Project>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projectsById: {},
  isLoading: false,
  error: null,
};

export const getProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("projects/getAll", async (_, { rejectWithValue }) => {
  try {
    return await getProjectsRequest();
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const getProjectsByServer = createAsyncThunk<
  Project[],
  number,
  { rejectValue: string }
>("projects/getByServer", async (serverId, { rejectWithValue }) => {
  try {
    return await getProjectsByServerRequest(serverId);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const getProjectById = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: { projects: ProjectState } }
>("projects/getById", async (id, { getState, rejectWithValue }) => {
  const state = getState();
  if (state.projects.projectsById[id]) return state.projects.projectsById[id];
  try {
    return await getProjectByIdRequest(id);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const createProject = createAsyncThunk<
  Project,
  Project,
  { rejectValue: string }
>("projects/create", async (data, { rejectWithValue }) => {
  try {
    return await createProjectRequest(data);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const updateProject = createAsyncThunk<
  Project,
  Project,
  { rejectValue: string }
>("projects/update", async (data, { rejectWithValue }) => {
  try {
    return await updateProjectRequest(data);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const deleteProject = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("projects/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteProjectRequest(id);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    upsertManyProjects: (state, action: PayloadAction<Project[]>) => {
      action.payload.forEach((p) => (state.projectsById[p.id] = p));
    },
    upsertProject: (state, action: PayloadAction<Project>) => {
      state.projectsById[action.payload.id] = action.payload;
    },
    removeProject: (state, action: PayloadAction<{ id: number }>) => {
      delete state.projectsById[action.payload.id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        action.payload.forEach((p) => (state.projectsById[p.id] = p));
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error";
      })

      .addCase(getProjectsByServer.fulfilled, (state, action) => {
        action.payload.forEach((p) => (state.projectsById[p.id] = p));
      })

      .addCase(getProjectById.fulfilled, (state, action) => {
        state.projectsById[action.payload.id] = action.payload;
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.projectsById[action.payload.id] = action.payload;
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        state.projectsById[action.payload.id] = action.payload;
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        delete state.projectsById[action.meta.arg];
      });
  },
});

export const { upsertManyProjects, upsertProject, removeProject } =
  projectSlice.actions;

export const selectProjectsById = (state: { projects: ProjectState }) =>
  state.projects.projectsById;

export const selectProjectById = createSelector(
  [selectProjectsById, (_: unknown, id: number) => id],
  (map, id) => map[id] ?? null
);

export const selectProjectsByServerId = createSelector(
  [selectProjectsById, (_: unknown, serverId: number) => serverId],
  (map, serverId) =>
    Object.values(map).filter(
      (p) =>
        p.channelDTOS.some((ch) => ch.serverId === serverId) ||
        p.channelDTOS.length === 0
    )
);

export default projectSlice.reducer;
