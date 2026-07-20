import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { LogoutDialog } from "./components/LogoutDialog";

export function App() {
  const user = useAuthStore((s) => s.user);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      <Routes>
        <Route
          path="/"
          element={<Home user={user} onAccount={() => setLogoutOpen(true)} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Routes>

      <LogoutDialog
        user={user}
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
}

function Home({
  user,
  onAccount,
}: {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  onAccount: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-max-width flex-col">
      {/* Top app bar — monochrome, outlined icons */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-margin-mobile backdrop-blur-md md:px-margin-desktop">
        <span className="material-symbols-outlined text-primary">menu</span>
        <Link
          to="/"
          className="font-headline-lg-mobile text-headline-lg-mobile tracking-[-0.06em] text-primary md:font-headline-lg md:text-headline-lg"
        >
          FOZ
        </Link>
        {user ? (
          <button
            type="button"
            onClick={onAccount}
            aria-label="Account"
            className="text-primary transition-opacity hover:opacity-70"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        ) : (
          <Link to="/login" className="text-primary transition-opacity hover:opacity-70">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        )}
      </header>

      <main className="flex flex-1 flex-col px-margin-mobile py-10 md:px-margin-desktop md:py-16">
        {user ? (
          <div className="mx-auto w-full max-w-sm">
            <h1 className="mb-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
              Welcome back
            </h1>
            <p className="mb-8 break-all font-body-lg text-body-lg text-secondary">
              Signed in as {user.email}.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/change-password"
                className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-4 text-primary transition-colors hover:bg-surface-container-low"
              >
                <span className="font-label-md text-label-md">Change password</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <button
                type="button"
                onClick={onAccount}
                className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-4 text-primary transition-colors hover:bg-surface-container-low"
              >
                <span className="font-label-md text-label-md">Log out</span>
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-sm text-center">
            <h1 className="mb-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
              A quieter place to talk
            </h1>
            <p className="mb-10 font-body-lg text-body-lg text-secondary">
              FOZ is a threads-style community forum. Create an account or sign in to join the
              conversation.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
              >
                Create account
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-outline-variant py-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low"
              >
                Log in
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="px-margin-mobile pb-8 text-center md:px-margin-desktop">
        <p className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
          FOZ
        </p>
      </footer>
    </div>
  );
}