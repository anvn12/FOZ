import { useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { LogoutDialog } from "./components/LogoutDialog";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { FeedPage } from "./pages/feed/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuthStore } from "./stores/auth";

export function App() {
  const user = useAuthStore((state) => state.user);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const interactionProps = { user, onAccount: () => setLogoutOpen(true) };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      <Routes>
        <Route path="/" element={<FeedPage {...interactionProps} />} />
        <Route path="/posts/:postId" element={<PostDetailRoute {...interactionProps} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Routes>
      <LogoutDialog user={user} open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}

function PostDetailRoute(props: React.ComponentProps<typeof FeedPage>) {
  const { postId = "" } = useParams();
  return <FeedPage {...props} postId={postId} />;
}
