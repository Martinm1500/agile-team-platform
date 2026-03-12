import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getServers,
  getServerById,
  createServer,
  updateServer,
  deleteServer,
  clearError,
  selectAllServers,
  updateServerMember,
  sendServerInvitation,
  acceptServerInvitation,
  rejectServerInvitation,
  discoverServers,
  joinServer,
  requestJoinServer,
  acceptJoinRequest,
  rejectJoinRequest,
  getOutgoingJoinRequests,
  removeServer,
} from "./serverSlice";

import type {
  CreateServerRequest,
  UpdateServerMemberRequest,
  UpdateServerRequest,
  SendInvitationRequest,
} from "./serverTypes";

export const useServer = () => {
  const dispatch = useAppDispatch();

  const serversById = useAppSelector((state) => state.servers.serversById);
  const isLoadingServers = useAppSelector(
    (state) => state.servers.isLoadingServers,
  );
  const isLoadingServerById = useAppSelector(
    (state) => state.servers.isLoadingServerById,
  );
  const serversError = useAppSelector((state) => state.servers.serversError);
  const serverByIdError = useAppSelector(
    (state) => state.servers.serverByIdError,
  );

  const allServers = useAppSelector(selectAllServers);

  const updateServerMemberRole = (
    serverId: number,
    userId: number,
    roleId: number,
  ) => {
    const data: UpdateServerMemberRequest = { serverId, userId, roleId };
    return dispatch(updateServerMember({ serverId, data }));
  };

  return {
    serversById,
    isLoadingServers,
    isLoadingServerById,
    serversError,
    serverByIdError,
    allServers,

    getServers: () => dispatch(getServers()),
    getServerById: (id: number) => dispatch(getServerById(id)),
    createServer: (data: CreateServerRequest) =>
      dispatch(createServer(data)).unwrap(),
    updateServer: (data: UpdateServerRequest) =>
      dispatch(updateServer(data)).unwrap(),
    deleteServer: (id: number) => dispatch(deleteServer(id)).unwrap(),

    clearError: () => dispatch(clearError()),

    getServerByIdFromState: (id: number) => serversById[id] ?? null,
    updateServerMemberRole,
    sendServerInvitation: (serverId: number, data: SendInvitationRequest) =>
      dispatch(sendServerInvitation({ serverId, data })).unwrap(),
    acceptServerInvitation: (serverId: number, invitationId: number) =>
      dispatch(acceptServerInvitation({ serverId, invitationId })).unwrap(),
    rejectServerInvitation: (serverId: number, invitationId: number) =>
      dispatch(rejectServerInvitation({ serverId, invitationId })).unwrap(),
    discoverServers: () => dispatch(discoverServers()).unwrap(),
    joinServer: async (serverId: number) => {
      await dispatch(joinServer(serverId)).unwrap();
      await dispatch(getServers());
    },
    requestJoinServer: async (serverId: number) => {
      await dispatch(requestJoinServer(serverId)).unwrap();
    },
    acceptJoinRequest: async (serverId: number, requestId: number) => {
      await dispatch(acceptJoinRequest({ serverId, requestId })).unwrap();
    },
    rejectJoinRequest: async (serverId: number, requestId: number) => {
      await dispatch(rejectJoinRequest({ serverId, requestId })).unwrap();
    },
    getOutgoingJoinRequests: () => dispatch(getOutgoingJoinRequests()),
    removeServer: (serverId: number) => dispatch(removeServer(serverId)),
  };
};
