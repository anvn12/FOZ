import { create } from "zustand";
import type { User } from "../types";

interface SessionState {
  activeUser: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeUser: null,
  setUser: (user) => set({ activeUser: user }),
  clearUser: () => set({ activeUser: null }),
}));
