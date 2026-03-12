// src/features/user/userTypes.ts
import type { User } from "../../types";

export interface Profile {
  userId: number;
  username: string;
  email: string;
  password: string;
  displayname: string;
  avatarUrl: string;
  status: string;
}

export interface Settings {
  allowDmsFromContacts: boolean;
  showCurrentActivity: boolean;
}

export interface UserState {
  profile: Profile | null;
  settings: Settings | null;
  users: Record<string, User>;
  isLoadingProfile: boolean;
  isLoadingSettings: boolean;
  isLoadingPassword: boolean;
  isLoadingUser: boolean;
  profileError: string | null;
  settingsError: string | null;
  passwordError: string | null;
  userError: string | null;
}
