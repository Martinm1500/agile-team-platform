//store/taskService
import api from "../../lib/axios";

export interface Task {
  id?: number;
  kanbanId: number;
  title: string;
  description?: string;
  dueDate?: string;
  columnId: number;
  assigneeId?: number | null;
  creatorUserId?: number | null;
}

export const createTaskRequest = async (dto: Task): Promise<Task> => {
  const res = await api.post<Task>(`/api/tasks`, dto);
  return res.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const res = await api.get<Task>(`/api/tasks/${id}`);
  return res.data;
};

export const getAllTasksForKanban = async (
  kanbanId: number
): Promise<Task[]> => {
  const res = await api.get<Task[]>(`/api/tasks/kanban/${kanbanId}`);
  return res.data;
};

export const editTaskRequest = async (
  id: number,
  dto: Partial<Task>
): Promise<Task> => {
  const res = await api.put<Task>(`/api/tasks/${id}`, dto);
  return res.data;
};

export const moveTaskRequest = async (
  id: number,
  dto: Partial<Task>
): Promise<Task> => {
  const res = await api.put<Task>(`/api/tasks/${id}/move`, dto);
  return res.data;
};

export const assignTaskRequest = async (
  id: number,
  userId: number
): Promise<Task> => {
  const res = await api.put<Task>(`/api/tasks/${id}/assign/${userId}`);
  return res.data;
};

export const deleteTaskRequest = async (id: number): Promise<void> => {
  const res = await api.delete<void>(`/api/tasks/${id}`);
  return res.data;
};
