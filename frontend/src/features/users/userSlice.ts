// src/features/user/userSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";
import type { User } from "../../types";
import type { Profile, Settings, UserState } from "./userTypes";
import {
  getProfileRequest,
  getSettingsRequest,
  updateProfileRequest,
  updateSettingsRequest,
  updatePasswordRequest,
  getUserByUsernameRequest,
  deleteAccountRequest,
} from "./userService";

const initialState: UserState = {
  profile: null,
  settings: null,
  users: {},
  isLoadingProfile: false,
  isLoadingSettings: false,
  isLoadingPassword: false,
  isLoadingUser: false,
  profileError: null,
  settingsError: null,
  passwordError: null,
  userError: null,
};

// -----------------------------
// Thunks
// -----------------------------
export const getProfile = createAsyncThunk<
  Profile,
  void,
  { rejectValue: string }
>("user/getProfile", async (_, { rejectWithValue }) => {
  try {
    return await getProfileRequest();
  } catch {
    return rejectWithValue("Error al obtener el perfil");
  }
});

export const getSettings = createAsyncThunk<
  Settings,
  void,
  { rejectValue: string }
>("user/getSettings", async (_, { rejectWithValue }) => {
  try {
    return await getSettingsRequest();
  } catch {
    return rejectWithValue("Error al obtener la configuración");
  }
});

export const updateProfile = createAsyncThunk<
  Profile,
  Partial<Profile>,
  { rejectValue: string }
>("user/updateProfile", async (data, { rejectWithValue }) => {
  try {
    return await updateProfileRequest(data);
  } catch {
    return rejectWithValue("Error al actualizar el perfil");
  }
});

export const updateSettings = createAsyncThunk<
  Settings,
  Partial<Settings>,
  { rejectValue: string }
>("user/updateSettings", async (data, { rejectWithValue }) => {
  try {
    return await updateSettingsRequest(data);
  } catch {
    return rejectWithValue("Error al actualizar la configuración");
  }
});

export const updatePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("user/updatePassword", async (data, { rejectWithValue }) => {
  try {
    await updatePasswordRequest(data);
  } catch {
    return rejectWithValue("Error al actualizar la contraseña");
  }
});

export const getUserByUsername = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("user/getUserByUsername", async (username, { rejectWithValue }) => {
  try {
    return await getUserByUsernameRequest(username);
  } catch {
    return rejectWithValue("Error al obtener el usuario");
  }
});

export const deleteAccount = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("user/deleteAccount", async (_, { rejectWithValue }) => {
  try {
    await deleteAccountRequest();
  } catch {
    return rejectWithValue("Error al eliminar la cuenta");
  }
});

// -----------------------------
// Slice
// -----------------------------
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.settingsError = null;
      state.passwordError = null;
      state.userError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET PROFILE
      .addCase(getProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload ?? "Error desconocido";
      })

      // GET SETTINGS
      .addCase(getSettings.pending, (state) => {
        state.isLoadingSettings = true;
        state.settingsError = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoadingSettings = false;
        state.settings = action.payload;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.isLoadingSettings = false;
        state.settingsError = action.payload ?? "Error desconocido";
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
        state.isLoadingProfile = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload ?? "Error desconocido";
      })

      // UPDATE SETTINGS
      .addCase(updateSettings.pending, (state) => {
        state.isLoadingSettings = true;
        state.settingsError = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
        state.isLoadingSettings = false;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoadingSettings = false;
        state.settingsError = action.payload ?? "Error desconocido";
      })

      // UPDATE PASSWORD
      .addCase(updatePassword.pending, (state) => {
        state.isLoadingPassword = true;
        state.passwordError = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoadingPassword = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoadingPassword = false;
        state.passwordError = action.payload ?? "Error desconocido";
      })

      // GET USER BY USERNAME
      .addCase(getUserByUsername.pending, (state) => {
        state.isLoadingUser = true;
        state.userError = null;
      })
      .addCase(getUserByUsername.fulfilled, (state, action) => {
        state.isLoadingUser = false;
        state.users[action.meta.arg] = action.payload;
      })
      .addCase(getUserByUsername.rejected, (state, action) => {
        state.isLoadingUser = false;
        state.userError = action.payload ?? "Error desconocido";
      })

      // DELETE ACCOUNT
      .addCase(deleteAccount.fulfilled, (state) => {
        state.profile = null;
        state.settings = null;
      })
      // Nuevo: Reset en logout
      .addCase(logout.fulfilled, () => initialState);
  },
});

// -----------------------------
// Selectors
// -----------------------------
export const selectUserState = (state: { user: UserState }) => state.user;

export const selectProfile = createSelector(
  [selectUserState],
  (userState) => userState.profile
);

export const selectSettings = createSelector(
  [selectUserState],
  (userState) => userState.settings
);

export const selectUsers = createSelector(
  [selectUserState],
  (userState) => userState.users
);

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
