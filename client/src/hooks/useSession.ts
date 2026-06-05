import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useSessionStore } from "../store/sessionStore";
import type { User } from "../types";

export function useSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeUser, setUser, clearUser } = useSessionStore();

  const clearFeedCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["feed"] });
  }, [queryClient]);

  useEffect(() => {
    api
      .get<User>("/api/session")
      .then(setUser)
      .catch(() => {
        /* no session */
      });
  }, [setUser]);

  const selectUser = useCallback(
    async (userId: string) => {
      clearFeedCache();
      const user = await api.post<User>("/api/session", { userId });
      setUser(user);
      navigate("/feed");
    },
    [clearFeedCache, navigate, setUser],
  );

  const clearSession = useCallback(async () => {
    await api.del<{ ok: boolean }>("/api/session");
    clearFeedCache();
    clearUser();
    navigate("/");
  }, [clearFeedCache, clearUser, navigate]);

  return { activeUser, selectUser, clearSession };
}
