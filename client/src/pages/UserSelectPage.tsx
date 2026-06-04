import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserSelectScreen } from "../components/user/UserSelectScreen";
import { useSessionStore } from "../store/sessionStore";

export function UserSelectPage() {
  const navigate = useNavigate();
  const activeUser = useSessionStore((s) => s.activeUser);

  useEffect(() => {
    if (activeUser) navigate("/feed", { replace: true });
  }, [activeUser, navigate]);

  return <UserSelectScreen />;
}
