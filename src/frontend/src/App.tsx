import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { LogoutDialog } from "./components/LogoutDialog";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
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
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { useAuthStore } from "./stores/auth";
import { RequireRole } from "./components/auth/RequireRole";
import { ModeratorDashboardPage } from "./pages/moderator/ModeratorDashboard";
import { ReportsQueuePage } from "./pages/moderator/ReportsQueue";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== "administrator") {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

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
        {/* Admin Dashboard Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
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


