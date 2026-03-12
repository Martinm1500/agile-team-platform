import api from "../../lib/axios";
import type {
  ProjectMember,
  SendInvitationRequest,
  UpdateProjectMemberRequest,
} from "./serverTypes";

export const getProjectMembersByProjectIdRequest = async (
  projectId: number
): Promise<ProjectMember[]> => {
  const res = await api.get<ProjectMember[]>(
    `/api/projects/${projectId}/members`
  );
  return res.data;
};

export const removeProjectMemberRequest = async (
  projectId: number,
  userId: number
): Promise<void> => {
  const res = await api.delete<void>(
    `/api/projects/${projectId}/members/${userId}`
  );
  return res.data;
};

export const updateProjectMemberRequest = async (
  projectId: number,
  data: UpdateProjectMemberRequest
): Promise<ProjectMember> => {
  const res = await api.put<ProjectMember>(
    `/api/projects/${projectId}/members`,
    data
  );
  return res.data;
};

export const sendProjectInvitationRequest = async (
  projectId: number,
  data: SendInvitationRequest //envuelve userId
): Promise<void> => {
  const res = await api.post<void>(
    `/api/projects/${projectId}/members/invitations`,
    data
  );
  return res.data;
};

export const acceptProjectInvitationRequest = async (
  projectId: number,
  invitationId: number
): Promise<void> => {
  const res = await api.post<void>(
    `/api/projects/${projectId}/members/invitations/${invitationId}/accept`
  );
  return res.data;
};

export const rejectProjectInvitationRequest = async (
  projectId: number,
  invitationId: number
): Promise<void> => {
  const res = await api.post<void>(
    `/api/projects/${projectId}/members/invitations/${invitationId}/reject`
  );
  return res.data;
};
