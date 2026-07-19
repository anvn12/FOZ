import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  role: "guest" | "standard" | "moderator" | "administrator";
  status: "active" | "suspended" | "banned" | "pending";
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  status: "guest" | "authed" | "refreshing";
  setSession: (args: { user: AuthUser; accessToken: string }) => void;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
  setRefreshing: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "guest",
  setSession: ({ user, accessToken }) =>
    set({ user, accessToken, status: "authed" }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ user: null, accessToken: null, status: "guest" }),
  setRefreshing: () => set({ status: "refreshing" }),
}));

export async function silentRefresh(fetchImpl: typeof fetch = fetch): Promise<boolean> {
  useAuthStore.getState().setRefreshing();
  try {
    const res = await fetchImpl("/api/v1/auth/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) {
      useAuthStore.getState().clearSession();
      return false;
    }
    const data = (await res.json()) as { accessToken: string; user: AuthUser };
    useAuthStore.getState().setSession({ user: data.user, accessToken: data.accessToken });
    return true;
  } catch {
    useAuthStore.getState().clearSession();
    return false;
  }
}
