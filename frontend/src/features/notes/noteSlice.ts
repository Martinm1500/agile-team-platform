// src/features/notes/noteSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Note } from "../../interfaces/interfaces";
import * as noteService from "./noteService";

interface NoteState {
  notes: Note[];
  loading: boolean;
  error?: string;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
};

export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (notesWorkspaceId: number) => {
    return await noteService.fetchNotes(notesWorkspaceId);
  }
);

export const fetchNoteById = createAsyncThunk(
  "notes/fetchNoteById",
  async ({
    notesWorkspaceId,
    id,
  }: {
    notesWorkspaceId: number;
    id: number;
  }) => {
    return await noteService.fetchNoteById(notesWorkspaceId, id);
  }
);

export const createNote = createAsyncThunk(
  "notes/createNote",
  async ({
    notesWorkspaceId,
    ...note
  }: { notesWorkspaceId: number } & Partial<Note>) => {
    return await noteService.createNote(notesWorkspaceId, note);
  }
);

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({
    notesWorkspaceId,
    id,
    ...note
  }: { notesWorkspaceId: number; id: number } & Partial<Note>) => {
    return await noteService.updateNote(notesWorkspaceId, id, note);
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async ({
    notesWorkspaceId,
    id,
  }: {
    notesWorkspaceId: number;
    id: number;
  }) => {
    await noteService.deleteNote(notesWorkspaceId, id);
    return id;
  }
);

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        const index = state.notes.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) state.notes[index] = action.payload;
        else state.notes.push(action.payload);
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) state.notes[index] = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((n) => n.id !== action.payload);
      });
  },
});

export default noteSlice.reducer;
