// src/lib/axios.ts
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { RootState, AppDispatch } from "../store";
import type { AuthResponse } from "../features/auth/authTypes";
import { logout } from "../features/auth/authSlice";

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const setupAxiosInterceptors = (store: {
  dispatch: AppDispatch;
  getState: () => RootState;
}) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (r: AxiosResponse) => r,
    async (error: AxiosError) => {
      const original = error.config as ExtendedAxiosRequestConfig | undefined;
      if (error.response?.status === 401 && original && !original._retry) {
        original._retry = true;

        const refresh = localStorage.getItem("refreshToken");
        if (!refresh) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        try {
          const tokens = await api
            .post<AuthResponse>("/api/auth/refresh", {
              refreshToken: refresh,
            })
            .then((res) => res.data);
          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("refreshToken", tokens.refreshToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${tokens.accessToken}`;
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(original);
        } catch {
          store.dispatch(logout());
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;
