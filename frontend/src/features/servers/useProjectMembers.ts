// src/features/server/useProjectMembers.ts
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hooks/redux";
import {
  selectProjectMembersByProjectId,
  updateProjectMember,
  sendProjectInvitation,
  acceptProjectInvitation,
  rejectProjectInvitation,
  removeProjectMember,
  getProjectMembers,
} from "./projectMemberSlice";
import type { RootState } from "../../store";
import type { SendInvitationRequest } from "./serverTypes";

// Hook para mutations (acciones que modifican el estado)
export const useProjectMemberMutations = () => {
  const dispatch = useAppDispatch();

  const fetchProjectMembers = useCallback(
    async (projectId: number) => {
      try {
        await dispatch(getProjectMembers(projectId)).unwrap();
      } catch (error) {
        console.error("Error al obtener miembros del proyecto:", error);
      }
    },
    [dispatch],
  );

  const updateProjectMemberSpecialty = useCallback(
    async (projectId: number, userId: number, specialtyId: number) => {
      try {
        await dispatch(
          updateProjectMember({ projectId, userId, specialtyId }),
        ).unwrap();
      } catch (error) {
        console.error(
          "Error al actualizar la especialidad del miembro:",
          error,
        );
      }
    },
    [dispatch],
  );

  const sendProjectInvitationAction = useCallback(
    async (projectId: number, data: SendInvitationRequest) => {
      try {
        await dispatch(sendProjectInvitation({ projectId, data })).unwrap();
      } catch (error) {
        console.error("Error al enviar invitación al proyecto:", error);
      }
    },
    [dispatch],
  );

  const acceptProjectInvitationAction = useCallback(
    async (projectId: number, invitationId: number) => {
      try {
        await dispatch(
          acceptProjectInvitation({ projectId, invitationId }),
        ).unwrap();
      } catch (error) {
        console.error("Error al aceptar invitación al proyecto:", error);
      }
    },
    [dispatch],
  );

  const rejectProjectInvitationAction = useCallback(
    async (projectId: number, invitationId: number) => {
      try {
        await dispatch(
          rejectProjectInvitation({ projectId, invitationId }),
        ).unwrap();
      } catch (error) {
        console.error("Error al rechazar invitación al proyecto:", error);
      }
    },
    [dispatch],
  );

  const removeProjectMemberAction = useCallback(
    async (projectId: number, userId: number) => {
      try {
        await dispatch(removeProjectMember({ projectId, userId })).unwrap();
      } catch (error) {
        console.error("Error al remover miembro del proyecto:", error);
      }
    },
    [dispatch],
  );

  return {
    fetchProjectMembers,
    updateProjectMemberSpecialty,
    sendProjectInvitationAction,
    acceptProjectInvitationAction,
    rejectProjectInvitationAction,
    removeProjectMemberAction,
  };
};

// Hooks específicos para queries (lecturas memoizadas)
// Estos solo causan re-renders si los datos relevantes cambian

export const useProjectMembersByProjectId = (projectId: number) => {
  return useSelector((state: RootState) =>
    selectProjectMembersByProjectId(state, projectId),
  );
};

export const useProjectMember = (projectId: number, userId: number) => {
  const members = useProjectMembersByProjectId(projectId);
  return useMemo(() => members.find((m) => m.userId === userId), [members]);
};
