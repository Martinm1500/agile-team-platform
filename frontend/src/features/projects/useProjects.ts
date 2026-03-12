// src/features/projects/useProjects.ts
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectMembers,
  addProjectMember,
  updateProjectMember,
  deleteProjectMember,
} from "./projectSlice";
import type { Project, ProjectMember } from "../../interfaces/interfaces";

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const { projects, currentProject, members, loading, error } = useAppSelector(
    (state) => state.projects
  );

  return {
    projects,
    currentProject,
    members,
    loading,
    error,
    fetchProjects: (serverId: number) => dispatch(fetchProjects(serverId)),
    fetchProjectById: (id: number) => dispatch(fetchProjectById(id)),
    createProject: (serverId: number, project: Partial<Project>) =>
      dispatch(createProject({ serverId, ...project })),
    updateProject: (id: number, project: Partial<Project>) =>
      dispatch(updateProject({ id, ...project })),
    deleteProject: (id: number) => dispatch(deleteProject(id)),
    fetchProjectMembers: (projectId: number) =>
      dispatch(fetchProjectMembers(projectId)),
    addProjectMember: (projectId: number, member: Partial<ProjectMember>) =>
      dispatch(addProjectMember({ projectId, ...member })),
    updateProjectMember: (
      projectId: number,
      userId: number,
      member: Partial<ProjectMember>
    ) => dispatch(updateProjectMember({ projectId, userId, ...member })),
    deleteProjectMember: (projectId: number, userId: number) =>
      dispatch(deleteProjectMember({ projectId, userId })),
  };
};
