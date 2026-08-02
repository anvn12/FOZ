import { useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { LogoutDialog } from "./components/LogoutDialog";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { PostPage } from "./pages/PostPage";
import { useAuthStore } from "./stores/auth";
import { RequireRole } from "./components/auth/RequireRole";
import { ModeratorDashboardPage } from "./pages/moderator/ModeratorDashboard";
import { ReportsQueuePage } from "./pages/moderator/ReportsQueue";

export function App() {
  const user = useAuthStore((state) => state.user);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      <Routes>
        <Route path="/" element={<Navigate to="/latest" replace />} />
        <Route path="/latest" element={<HomePage feedType="latest" />} />
        <Route path="/foryou" element={<HomePage feedType="for-you" />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/profiles/:userId" element={<ProfilePage />} />

        {/* Moderator Routes */}
        <Route 
          path="/moderator" 
          element={
            <RequireRole roles={["moderator", "administrator"]}>
              <ModeratorDashboardPage />
            </RequireRole>
          } 
        />
        <Route 
          path="/moderator/queue" 
          element={
            <RequireRole roles={["moderator", "administrator"]}>
              <ReportsQueuePage />
            </RequireRole>
          } 
        />
      </Routes>
      <LogoutDialog user={user} open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}


