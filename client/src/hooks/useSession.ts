import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useSessionStore } from "../store/sessionStore";
import type { User } from "../types";

export function useSession() {
  const navigate = useNavigate();
  const { activeUser, setUser, clearUser } = useSessionStore();

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
      const user = await api.post<User>("/api/session", { userId });
      setUser(user);
      navigate("/feed");
    },
    [navigate, setUser],
  );

  const clearSession = useCallback(async () => {
    await api.del<{ ok: boolean }>("/api/session");
    clearUser();
    navigate("/");
  }, [clearUser, navigate]);

  return { activeUser, selectUser, clearSession };
}
