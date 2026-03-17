import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getMembersByServerId,
  clearError,
  kickMember,
  banMember,
} from "./memberSlice";
import { useCallback } from "react";

export const useMembers = () => {
  const dispatch = useAppDispatch();

  const membersByServerId = useAppSelector(
    (state) => state.members.membersByServerId
  );
  const isLoadingMembers = useAppSelector(
    (state) => state.members.isLoadingMembers
  );
  const membersError = useAppSelector((state) => state.members.membersError);

  const memoizedGetMembersByServerId = useCallback(
    (serverId: number) => dispatch(getMembersByServerId(serverId)),
    [dispatch]
  );

  const memoizedClearError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const memoizedKickMember = useCallback(
    (serverId: number, userId: number) =>
      dispatch(kickMember({ serverId, userId })),
    [dispatch]
  );

  const memoizedBanMember = useCallback(
    (serverId: number, userId: number) =>
      dispatch(banMember({ serverId, userId })),
    [dispatch]
  );

  const getMembersForServerFromState = useCallback(
    (serverId: number) => Object.values(membersByServerId[serverId] ?? {}),
    [membersByServerId]
  );

  const getMemberForServerByUserIdFromState = useCallback(
    (serverId: number, userId: number) =>
      membersByServerId[serverId]?.[userId] ?? null,
    [membersByServerId]
  );

  return {
    membersByServerId,
    isLoadingMembers,
    membersError,
    getMembersByServerId: memoizedGetMembersByServerId,
    clearError: memoizedClearError,
    kickMember: memoizedKickMember,
    banMember: memoizedBanMember,
    getMembersForServerFromState,
    getMemberForServerByUserIdFromState,
  };
};
