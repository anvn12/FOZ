import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { LogoutDialog } from "./components/LogoutDialog";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { FeedPage } from "./pages/feed/FeedPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { PostPage } from "./pages/PostPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { useAuthStore } from "./stores/auth";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== "administrator") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const user = useAuthStore((state) => state.user);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const interactionProps = { user, onAccount: () => setLogoutOpen(true) };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/feed" element={<FeedPage {...interactionProps} />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/profiles/:userId" element={<ProfilePage />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
        <Route path="/admin/users" element={<AdminGuard><AdminUsersPage /></AdminGuard>} />
        <Route path="/admin/audit-logs" element={<AdminGuard><AdminAuditLogsPage /></AdminGuard>} />
        <Route path="/admin/reports" element={<AdminGuard><AdminReportsPage /></AdminGuard>} />
        <Route path="/admin/categories" element={<AdminGuard><AdminCategoriesPage /></AdminGuard>} />
        <Route path="/admin/settings" element={<AdminGuard><AdminSettingsPage /></AdminGuard>} />
      </Routes>
      <LogoutDialog user={user} open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}



