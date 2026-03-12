// src/features/auth/useAuth.ts
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { login, register, logout, clearError } from "./authSlice";
import type { LoginRequest, RegisterRequest } from "./authTypes";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.auth);

  return {
    ...state,
    login: (d: LoginRequest) => dispatch(login(d)),
    register: (d: RegisterRequest) => dispatch(register(d)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};
