//store/kanbanService
import api from "../../lib/axios";

export interface Kanban {
  id: number;
  projectId?: number | null;
  ownerId: number;
  name: string;
  columns: Column[];
}

export interface Column {
  id: number;
  kanbanId: number;
  name: string;
  status: string;
}

export const createKanbanRequest = async (dto: {
  name: string;
}): Promise<Kanban> => {
  const res = await api.post<Kanban>(`/api/kanban-workspaces`, dto);
  return res.data;
};

export const getKanbanById = async (id: number): Promise<Kanban> => {
  const res = await api.get<Kanban>(`/api/kanban-workspaces/${id}`);
  return res.data;
};

export const getAllKanbans = async (): Promise<Kanban[]> => {
  const res = await api.get<Kanban[]>(`/api/kanban-workspaces`);
  return res.data;
};

export const updateKanbanRequest = async (
  id: number,
  dto: { name: string }
): Promise<Kanban> => {
  const res = await api.put<Kanban>(`/api/kanban-workspaces/${id}`, dto);
  return res.data;
};

export const deleteKanbanRequest = async (id: number): Promise<void> => {
  const res = await api.delete<void>(`/api/kanban-workspaces/${id}`);
  return res.data;
};
