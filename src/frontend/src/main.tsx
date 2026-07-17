import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { App } from "./App";
import { silentRefresh } from "./stores/auth";
import "./index.css";

const queryClient = new QueryClient();

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

// On app load: try to silently restore the session from the refresh cookie,
// then render. Whether or not refresh succeeds, we still render — the
// unauthenticated state is the default.
void silentRefresh().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
});
