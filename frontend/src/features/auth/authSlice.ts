import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginRequest,
  registerRequest,
  refreshTokenRequest,
  logoutRequest,
  getCurrentUserRequest,
  getErrorMessage,
} from "./authService";
import type {
  AuthResponse,
  AuthState,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  User,
} from "./authTypes";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isRefreshing: false,
};

// -----------------------------
// Thunks
// -----------------------------

export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    return await loginRequest(data);
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    return await registerRequest(data);
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const refreshToken = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("refreshToken");
    if (!token) throw new Error("No refresh token");
    return await refreshTokenRequest(token);
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const logout = createAsyncThunk<
  MessageResponse,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    return await logoutRequest();
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/me", async (_, { rejectWithValue }) => {
  try {
    const profile = await getCurrentUserRequest();
    return {
      id: profile.userId,
      name: profile.displayname || profile.username,
      avatarUrl: profile.avatarUrl,
    };
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

// -----------------------------
// Slice
// -----------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      state.accessToken = localStorage.getItem("accessToken");
      state.refreshToken = localStorage.getItem("refreshToken");
      state.isAuthenticated = !!(state.accessToken && state.refreshToken);
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
      })
      .addCase(login.fulfilled, (s, action) => {
        s.loading = false;
        s.accessToken = action.payload.accessToken;
        s.refreshToken = action.payload.refreshToken;
        s.isAuthenticated = true;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? null;
      })

      .addCase(register.pending, (s) => {
        s.loading = true;
      })
      .addCase(register.fulfilled, (s, action) => {
        s.loading = false;
        s.accessToken = action.payload.accessToken;
        s.refreshToken = action.payload.refreshToken;
        s.isAuthenticated = true;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? null;
      })

      .addCase(refreshToken.pending, (s) => {
        s.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (s, action) => {
        s.isRefreshing = false;
        s.accessToken = action.payload.accessToken;
        s.refreshToken = action.payload.refreshToken;
        s.isAuthenticated = true;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (s, a) => {
        s.isRefreshing = false;
        s.error = a.payload ?? null;
        s.isAuthenticated = false;
      })

      .addCase(getCurrentUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (s, action) => {
        s.loading = false;
        s.user = action.payload;
        s.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? null;
      })

      .addCase(logout.fulfilled, (s) => {
        s.accessToken = null;
        s.refreshToken = null;
        s.user = null;
        s.isAuthenticated = false;
        s.loading = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .addCase(logout.rejected, (s, a) => {
        s.error = a.payload ?? null;
      });
  },
});

export const { clearError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
