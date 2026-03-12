// src/features/notes/noteService.ts
import axios from "axios";
import type { Note } from "../../interfaces/interfaces";

const API_BASE = "http://localhost:8080";

export const fetchNotes = async (notesWorkspaceId: number): Promise<Note[]> => {
  const response = await axios.get(
    `${API_BASE}/notes-workspaces/${notesWorkspaceId}/notes`
  );
  return response.data;
};

export const fetchNoteById = async (
  notesWorkspaceId: number,
  id: number
): Promise<Note> => {
  const response = await axios.get(
    `${API_BASE}/notes-workspaces/${notesWorkspaceId}/notes/${id}`
  );
  return response.data;
};

export const createNote = async (
  notesWorkspaceId: number,
  note: Partial<Note>
): Promise<Note> => {
  const response = await axios.post(
    `${API_BASE}/notes-workspaces/${notesWorkspaceId}/notes`,
    note
  );
  return response.data;
};

export const updateNote = async (
  notesWorkspaceId: number,
  id: number,
  note: Partial<Note>
): Promise<Note> => {
  const response = await axios.put(
    `${API_BASE}/notes-workspaces/${notesWorkspaceId}/notes/${id}`,
    note
  );
  return response.data;
};

export const deleteNote = async (
  notesWorkspaceId: number,
  id: number
): Promise<void> => {
  await axios.delete(
    `${API_BASE}/notes-workspaces/${notesWorkspaceId}/notes/${id}`
  );
};
