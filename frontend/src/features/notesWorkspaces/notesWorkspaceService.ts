// src/features/notesWorkspaces/notesWorkspaceService.ts
import axios from "axios";
import type { NotesWorkspace } from "../../interfaces/interfaces";

const API_BASE = "http://localhost:8080";

export const fetchNotesWorkspace = async (
  projectId: number
): Promise<NotesWorkspace> => {
  const response = await axios.get(
    `${API_BASE}/projects/${projectId}/notes-workspace`
  );
  return response.data;
};

export const createNotesWorkspace = async (
  projectId: number,
  workspace: Partial<NotesWorkspace>
): Promise<NotesWorkspace> => {
  const response = await axios.post(
    `${API_BASE}/projects/${projectId}/notes-workspace`,
    workspace
  );
  return response.data;
};

export const updateNotesWorkspace = async (
  id: number,
  workspace: Partial<NotesWorkspace>
): Promise<NotesWorkspace> => {
  const response = await axios.put(
    `${API_BASE}/notes-workspaces/${id}`,
    workspace
  );
  return response.data;
};
