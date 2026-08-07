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

export function checkUsernameAvailability(username: string) {
  return call<{ available: boolean; reason?: string | null }>(
    `/api/v1/auth/check-username?username=${encodeURIComponent(username)}`,
    { method: "GET" },
  );
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
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        user: data.user as AuthUser,
        accessToken: data.accessToken,
      });
    },
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

export function initiateSocialAuth(provider: "google", isMobile: boolean): Promise<AuthResponse | null> {
  const mode = isMobile ? "redirect" : "popup";
  const url = `/api/v1/auth/${provider}?mode=${mode}`;

  if (isMobile) {
    window.location.href = url;
    return Promise.resolve(null);
  }

  return new Promise<AuthResponse | null>((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      `${provider}_auth_popup`,
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`,
    );

    if (!popup) {
      window.location.href = url;
      return resolve(null);
    }

    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === "SOCIAL_AUTH_SUCCESS" && event.data?.payload) {
        window.removeEventListener("message", messageHandler);
        clearInterval(timer);
        const data = event.data.payload as AuthResponse;
        useAuthStore.getState().setSession({
          user: data.user as AuthUser,
          accessToken: data.accessToken,
        });
        resolve(data);
      } else if (event.data?.type === "SOCIAL_AUTH_ERROR") {
        window.removeEventListener("message", messageHandler);
        clearInterval(timer);
        reject(new ApiError(400, "SOCIAL_AUTH_FAILED", event.data?.error || "Social authentication failed."));
      }
    };

    window.addEventListener("message", messageHandler);

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener("message", messageHandler);
        reject(new ApiError(400, "AUTH_CANCELLED", "Social authentication was cancelled or closed."));
      }
    }, 1000);
  });
}

