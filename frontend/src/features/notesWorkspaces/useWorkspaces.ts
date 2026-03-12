// src/features/notesWorkspaces/useNotesWorkspaces.ts
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import {
  fetchNotesWorkspace,
  createNotesWorkspace,
  updateNotesWorkspace,
} from "./noteWorkspaceSlice";
import type { NotesWorkspace } from "../../interfaces/interfaces";

export const useNotesWorkspaces = () => {
  const dispatch = useAppDispatch();
  const { workspace, loading, error } = useAppSelector(
    (state) => state.notesWorkspaces
  );

  return {
    workspace,
    loading,
    error,
    fetchNotesWorkspace: (projectId: number) =>
      dispatch(fetchNotesWorkspace(projectId)),
    createNotesWorkspace: (
      projectId: number,
      workspace: Partial<NotesWorkspace>
    ) => dispatch(createNotesWorkspace({ projectId, ...workspace })),
    updateNotesWorkspace: (id: number, workspace: Partial<NotesWorkspace>) =>
      dispatch(updateNotesWorkspace({ id, ...workspace })),
  };
};
