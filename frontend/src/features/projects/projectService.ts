// src/features/project/projectService.ts
import api from "../../lib/axios";
import type { Project } from "../servers/serverTypes";

export const getProjectsRequest = async (): Promise<Project[]> => {
  const res = await api.get<Project[]>("/api/projects");
  return res.data;
};

export const getProjectsByServerRequest = async (
  serverId: number
): Promise<Project[]> => {
  const res = await api.get<Project[]>(`/api/servers/${serverId}/projects`);
  return res.data;
};

export const getProjectByIdRequest = async (id: number): Promise<Project> => {
  const res = await api.get<Project>(`/api/projects/${id}`);
  return res.data;
};

export const createProjectRequest = async (data: Project): Promise<Project> => {
  const res = await api.post<Project>("/api/projects", data);
  return res.data;
};

export const updateProjectRequest = async (data: Project): Promise<Project> => {
  const res = await api.put<Project>(`/api/projects/${data.id}`, data);
  return res.data;
};

export const deleteProjectRequest = async (id: number): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
