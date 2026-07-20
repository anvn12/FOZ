import { Routes, Route, Link } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { useLogout } from "./api/auth";
import { ProfilePage } from "./pages/ProfilePage";
import { useProfile } from "./api/profile";

function ProfileNavBarAvatar({ userId }: { userId: string }) {
  const { data: profile } = useProfile(userId);
  if (!profile) {
    return <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold" />;
  }
  if (profile.avatarUrl) {
    return <img src={profile.avatarUrl} alt="avatar" className="h-7 w-7 rounded-full object-cover border border-zinc-200" />;
  }
  const initials = profile.displayName.charAt(0).toUpperCase() || "?";
  return (
    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
}

export function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-zinc-950">
          FOZ
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to={`/profiles/${user.id}`} className="flex items-center gap-2 text-zinc-700 hover:text-zinc-950 font-medium">
              <ProfileNavBarAvatar userId={user.id} />
              <span>Profile</span>
            </Link>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 font-semibold cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-3 text-sm">
            <Link to="/login" className="text-zinc-700 hover:underline">
              Sign in
            </Link>
            <Link to="/register" className="text-zinc-700 hover:underline">
              Create account
            </Link>
          </div>
        )}
      </header>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/profiles/:userId" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function HomePlaceholder() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      {user ? (
        <p>
          Welcome, {user.email}.{" "}
          <Link to="/change-password" className="text-blue-600 hover:underline">
            Change password
          </Link>
        </p>
      ) : (
        <p>
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>{" "}
          or{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            sign in
          </Link>{" "}
          to get started.
        </p>
      )}
    </div>
  );
}
