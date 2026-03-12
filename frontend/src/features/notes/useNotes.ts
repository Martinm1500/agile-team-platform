// src/features/notes/useNotes.ts
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import {
  fetchNotes,
  fetchNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "./noteSlice";
import type { Note } from "../../interfaces/interfaces";

export const useNotes = () => {
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector((state) => state.notes);

  return {
    notes,
    loading,
    error,
    fetchNotes: (notesWorkspaceId: number) =>
      dispatch(fetchNotes(notesWorkspaceId)),
    fetchNoteById: (notesWorkspaceId: number, id: number) =>
      dispatch(fetchNoteById({ notesWorkspaceId, id })),
    createNote: (notesWorkspaceId: number, note: Partial<Note>) =>
      dispatch(createNote({ notesWorkspaceId, ...note })),
    updateNote: (notesWorkspaceId: number, id: number, note: Partial<Note>) =>
      dispatch(updateNote({ notesWorkspaceId, id, ...note })),
    deleteNote: (notesWorkspaceId: number, id: number) =>
      dispatch(deleteNote({ notesWorkspaceId, id })),
  };
};
