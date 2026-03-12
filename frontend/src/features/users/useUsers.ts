// src/features/user/useUsers.ts
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getProfile,
  getSettings,
  updateProfile,
  updateSettings,
  updatePassword,
  getUserByUsername,
  deleteAccount,
  clearError,
  selectProfile,
  selectSettings,
  selectUsers,
} from "./userSlice";
import type { Profile, Settings } from "./userTypes";

export const useUsers = () => {
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectProfile);
  const settings = useAppSelector(selectSettings);
  const users = useAppSelector(selectUsers);
  const isLoadingProfile = useAppSelector(
    (state) => state.user.isLoadingProfile
  );
  const isLoadingSettings = useAppSelector(
    (state) => state.user.isLoadingSettings
  );
  const isLoadingPassword = useAppSelector(
    (state) => state.user.isLoadingPassword
  );
  const isLoadingUser = useAppSelector((state) => state.user.isLoadingUser);
  const profileError = useAppSelector((state) => state.user.profileError);
  const settingsError = useAppSelector((state) => state.user.settingsError);
  const passwordError = useAppSelector((state) => state.user.passwordError);
  const userError = useAppSelector((state) => state.user.userError);

  return {
    profile,
    settings,
    users,
    isLoadingProfile,
    isLoadingSettings,
    isLoadingPassword,
    isLoadingUser,
    profileError,
    settingsError,
    passwordError,
    userError,

    getProfile: () => dispatch(getProfile()),
    getSettings: () => dispatch(getSettings()),
    updateProfile: (data: Partial<Profile>) => dispatch(updateProfile(data)),
    updateSettings: (data: Partial<Settings>) => dispatch(updateSettings(data)),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      dispatch(updatePassword(data)),
    getUserByUsername: (username: string) =>
      dispatch(getUserByUsername(username)),
    deleteAccount: () => dispatch(deleteAccount()),
    clearError: () => dispatch(clearError()),
  };
};
