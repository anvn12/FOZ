import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { App } from "./App";
import { silentRefresh, useAuthStore, type AuthUser } from "./stores/auth";
import { fetchWithNetworkGuard } from "./api/network";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    // Always invoke query/mutation functions regardless of browser online
    // status so our fetchWithNetworkGuard can detect offline and toast,
    // rather than react-query silently pausing the request.
    queries: { networkMode: "always" },
    mutations: { networkMode: "always" },
  },
});

function Root() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

/**
 * If the URL has a ?token= param (set by the OAuth redirect flow when the
 * backend redirects back to the frontend), exchange it for the full user
 * object via GET /api/v1/auth/me and populate the auth store.
 *
 * This handles both:
 *  - Mobile redirect mode (window.location.href = backend/google?mode=redirect)
 *  - Popup fallback when window.opener is unavailable in the popup window
 */
async function handleOAuthTokenParam(): Promise<void> {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  if (!token) return;
  const isNewUser = url.searchParams.get("new") === "1";

  // Clean the token from the URL immediately so it's not visible or bookmarkable
  url.searchParams.delete("token");
  url.searchParams.delete("new");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);

  try {
    const res = await fetchWithNetworkGuard("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (res.ok) {
      const data = (await res.json()) as { user: AuthUser };
      useAuthStore.getState().setSession({ user: data.user, accessToken: token });
      if (isNewUser) {
        window.location.replace("/onboarding/avatar");
      }
    }
  } catch {
    // If /me fails (network error, expired token, etc.) we just remain as guest.
    // silentRefresh() already ran and will handle cookie-based session restore.
  }
}

// On app load:
// 1. Try to restore the session from the refresh cookie (silentRefresh).
// 2. If an OAuth redirect deposited a ?token= in the URL, use it to hydrate the store.
// 3. Render regardless of auth outcome — the unauthenticated state is the default.
void silentRefresh()
  .finally(() => handleOAuthTokenParam())
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
  });
