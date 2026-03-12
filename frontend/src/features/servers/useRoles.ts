// src/features/server/useRoles.ts
import { useAppSelector } from "../../hooks/redux";
import { selectServerRoles } from "./serverSlice";
import type { Role } from "./serverTypes";

type UseRoles = (serverId: number | undefined | null) => {
  roles: Role[];
  isLoading: boolean;
};

export const useRoles: UseRoles = (serverId) => {
  const roles = useAppSelector((state) =>
    serverId ? selectServerRoles(state, serverId) : []
  );

  const isLoadingServerById = useAppSelector(
    (state) => state.servers.isLoadingServerById
  );

  const server = useAppSelector((state) =>
    serverId ? state.servers.serversById[serverId] : null
  );
  const hasRolesLoaded = !!server?.roleIds?.length || false;

  return {
    roles,
    isLoading: serverId ? isLoadingServerById : false,
    hasRolesLoaded,
  };
};
