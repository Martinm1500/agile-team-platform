// src/features/notesWorkspaces/notesWorkspaceSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NotesWorkspace } from "../../interfaces/interfaces";
import * as notesWorkspaceService from "./notesWorkspaceService";

interface NotesWorkspaceState {
  workspace?: NotesWorkspace;
  loading: boolean;
  error?: string;
}

const initialState: NotesWorkspaceState = {
  loading: false,
};

export const fetchNotesWorkspace = createAsyncThunk(
  "notesWorkspaces/fetchNotesWorkspace",
  async (projectId: number) => {
    return await notesWorkspaceService.fetchNotesWorkspace(projectId);
  }
);

export const createNotesWorkspace = createAsyncThunk(
  "notesWorkspaces/createNotesWorkspace",
  async ({
    projectId,
    ...workspace
  }: { projectId: number } & Partial<NotesWorkspace>) => {
    return await notesWorkspaceService.createNotesWorkspace(
      projectId,
      workspace
    );
  }
);

export const updateNotesWorkspace = createAsyncThunk(
  "notesWorkspaces/updateNotesWorkspace",
  async ({ id, ...workspace }: { id: number } & Partial<NotesWorkspace>) => {
    return await notesWorkspaceService.updateNotesWorkspace(id, workspace);
  }
);

const notesWorkspaceSlice = createSlice({
  name: "notesWorkspaces",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotesWorkspace.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotesWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.workspace = action.payload;
      })
      .addCase(fetchNotesWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createNotesWorkspace.fulfilled, (state, action) => {
        state.workspace = action.payload;
      })
      .addCase(updateNotesWorkspace.fulfilled, (state, action) => {
        state.workspace = action.payload;
      });
  },
});

export default notesWorkspaceSlice.reducer;
