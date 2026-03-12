// src/features/auth/authService.ts
import axios, { AxiosError } from "axios";
import api from "../../lib/axios";
import type {
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  AuthResponse,
  MessageResponse,
  Profile,
} from "./authTypes";

// -----------------------------
// Helper de errores
// -----------------------------
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    return (
      (axiosError.response?.data as { message?: string; error?: string })
        ?.message ||
      (axiosError.response?.data as { message?: string; error?: string })
        ?.error ||
      axiosError.message
    );
  }

  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

// -----------------------------
// Requests HTTP
// -----------------------------
export const loginRequest = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/api/auth/login", credentials);
  return res.data;
};

export const registerRequest = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/api/auth/register", data);
  return res.data;
};

export const refreshTokenRequest = async (
  token: string
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/api/auth/refresh", {
    refreshToken: token,
  } as RefreshRequest);
  return res.data;
};

export const logoutRequest = async (): Promise<MessageResponse> => {
  const res = await api.post<MessageResponse>("/api/auth/logout");
  return res.data;
};

export const getCurrentUserRequest = async (): Promise<Profile> => {
  const res = await api.get<Profile>("/api/users/me");
  return res.data;
};
