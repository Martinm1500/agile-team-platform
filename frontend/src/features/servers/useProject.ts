import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createProject as createProjectThunk,
  deleteProject as deleteProjectThunk,
  updateProject as updateProjectThunk,
  clearError,
  selectProjectsByServerId,
} from "./serverSlice";
import type {
  CreateProjectRequest,
  ProjectBase,
  Project,
  NormalizedServersState,
  ProjectDTO,
} from "./serverTypes";

export const useProject = () => {
  const dispatch = useAppDispatch();

  const projectsById = useAppSelector((state) => state.servers.projects);
  const serversById = useAppSelector((state) => state.servers.serversById);

  const isLoading = useAppSelector((state) => state.servers.isLoadingServers);
  const error = useAppSelector((state) => state.servers.serversError);

  const createProject = async (
    serverId: number,
    data: {
      name: string;
      hasKanban: boolean;
      hasNotes: boolean;
    }
  ): Promise<ProjectBase> => {
    const requestData: CreateProjectRequest = {
      serverId,
      ...data,
    };

    const fullProject: Project = await dispatch(
      createProjectThunk({ serverId, data: requestData })
    ).unwrap();

    const projectBase: ProjectBase = {
      id: fullProject.id,
      serverId,
      ownerId: fullProject.projectCreator.userId,
      name: fullProject.name,
      kanban: !!fullProject.kanbanWorkspace,
      smartNotes: !!fullProject.notesWorkspace,
      textChannelId: fullProject.channels.find((ch) => ch.type === "TEXT")?.id,
      voiceChannelId: fullProject.channels.find((ch) => ch.type === "VOICE")
        ?.id,
      kanbanWorkspaceId: fullProject.kanbanWorkspace?.id,
      smartNotesWorkspaceId: fullProject.notesWorkspace?.id,
    };

    return projectBase;
  };

  const updateProject = async (
    projectId: number,
    data: {
      name?: string;
      description?: string;
      hasKanban?: boolean;
      hasNotes?: boolean;
    }
  ): Promise<ProjectBase> => {
    const currentProject = getProjectById(projectId);
    if (!currentProject) {
      throw new Error("Proyecto no encontrado");
    }

    const updateData: ProjectDTO = {
      id: projectId,
      serverId: currentProject.serverId,
      creatorId: currentProject.ownerId,
      name: data.name ?? currentProject.name,
      hasKanban: data.hasKanban ?? currentProject.kanban,
      hasNotes: data.hasNotes ?? currentProject.smartNotes,
    };

    const returnedDTO: ProjectDTO = await dispatch(
      updateProjectThunk({ projectId, data: updateData })
    ).unwrap();

    const projectBase: ProjectBase = {
      ...currentProject,
      name: returnedDTO.name,
      kanban: returnedDTO.hasKanban,
      smartNotes: returnedDTO.hasNotes,
    };

    if (!returnedDTO.hasKanban) {
      projectBase.kanbanWorkspaceId = undefined;
    }

    if (!returnedDTO.hasNotes) {
      projectBase.smartNotesWorkspaceId = undefined;
    }

    return projectBase;
  };

  const getProjectById = (id: number): ProjectBase | null =>
    projectsById[id] ?? null;

  const getProjectsByServerId = (serverId: number): ProjectBase[] => {
    const server = serversById[serverId];
    if (!server) return [];
    return server.projectIds
      .map((id) => projectsById[id])
      .filter(Boolean) as ProjectBase[];
  };

  const deleteProject = async (projectId: number): Promise<void> => {
    await dispatch(deleteProjectThunk(projectId)).unwrap();
  };

  return {
    projectsById,
    isLoading,
    error,
    createProject,
    updateProject,
    clearError: () => dispatch(clearError()),
    getProjectById,
    getProjectsByServerId,
    deleteProject,
  };
};

// Selectores legacy (por si algún componente viejo los usa)
export const useProjects = () =>
  useAppSelector((state) => state.servers.projects);

export const useProjectById = (id: number) =>
  useAppSelector((state) => state.servers.projects[id] ?? null);

export const useProjectsByServerId = (serverId: number) =>
  useAppSelector((state) => selectProjectsByServerId(state, serverId));

export const getProjectsByServerId = (
  state: { servers: NormalizedServersState },
  serverId: number
) => selectProjectsByServerId(state, serverId);
