import { useMutation } from "@tanstack/react-query";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshResponse,
  ChangePasswordRequest,
  ErrorEnvelope,
} from "#shared/schemas/auth";
import { useAuthStore, type AuthUser } from "#frontend/stores/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  // Inject the access token from the store if we have one. Endpoints that
  // don't need it (register, login, refresh) just ignore the header.
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const env = (await res.json().catch(() => null)) as ErrorEnvelope | null;
    throw new ApiError(
      res.status,
      env?.error?.code ?? "UNKNOWN",
      env?.error?.message ?? "Request failed",
      env?.error?.fields,
    );
  }
  return res.json() as Promise<T>;
}

export function register(input: RegisterRequest) {
  return call<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginRequest) {
  return call<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return call<{ ok: true }>("/api/v1/auth/logout", { method: "POST" });
}

export function refresh() {
  return call<RefreshResponse>("/api/v1/auth/refresh", { method: "POST" });
}

export function changePassword(input: ChangePasswordRequest) {
  return call<{ ok: true }>("/api/v1/auth/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        user: data.user as AuthUser,
        accessToken: data.accessToken,
      });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => useAuthStore.getState().clearSession(),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
