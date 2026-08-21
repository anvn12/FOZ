import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(
  ui: ReactElement,
  options?: {
    route?: string;
    queryClient?: QueryClient;
    renderOptions?: Omit<RenderOptions, "wrapper">;
  },
) {
  const queryClient =
    options?.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          networkMode: "always",
        },
        mutations: {
          networkMode: "always",
        },
      },
    });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[options?.route ?? "/"]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...options?.renderOptions }),
    queryClient,
  };
}

export * from "@testing-library/react";
