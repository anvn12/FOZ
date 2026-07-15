import { Routes, Route, Link } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useLogout } from "./api/auth";

export function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          FOZ
        </Link>
        {user ? (
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
          >
            Sign out
          </button>
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
      </Routes>
    </div>
  );
}

function HomePlaceholder() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}.</p>
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
