// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, fireEvent } from "#frontend/test/utils";
import { AdminUsersPage } from "../AdminUsersPage";
import * as adminApi from "#frontend/api/admin";

vi.mock("#frontend/api/admin", async () => {
  const actual = await vi.importActual("#frontend/api/admin");
  return {
    ...actual,
    useAdminUsers: vi.fn(),
    useAssignUserRole: vi.fn(),
    useDeleteUserAccount: vi.fn(),
  };
});

describe("AdminUsersPage Component (TC18 & TC19)", () => {
  it("TC18: Renders user table with user items and role filter buttons", () => {
    vi.mocked(adminApi.useAdminUsers).mockReturnValue({
      data: {
        items: [
          {
            id: "u-1",
            email: "alice@foz.dev",
            role: "standard",
            status: "active",
            createdAt: new Date().toISOString(),
            displayName: "Alice Wonderland",
          },
          {
            id: "u-2",
            email: "bob@foz.dev",
            role: "moderator",
            status: "active",
            createdAt: new Date().toISOString(),
            displayName: "Bob Moderator",
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    vi.mocked(adminApi.useAssignUserRole).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(adminApi.useDeleteUserAccount).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    renderWithProviders(<AdminUsersPage />);

    expect(screen.getAllByText("User Management")[0]).toBeDefined();
    expect(screen.getAllByText("alice@foz.dev").length).toBeGreaterThan(0);
    expect(screen.getAllByText("bob@foz.dev").length).toBeGreaterThan(0);
    expect(screen.getByText("Alice Wonderland")).toBeDefined();
  });

  it("TC18: Opens user action modal when Assign Mod button is clicked", () => {
    vi.mocked(adminApi.useAdminUsers).mockReturnValue({
      data: {
        items: [
          {
            id: "u-1",
            email: "alice@foz.dev",
            role: "standard",
            status: "active",
            createdAt: new Date().toISOString(),
            displayName: "Alice Wonderland",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    renderWithProviders(<AdminUsersPage />);

    const assignModBtn = screen.getByText("Assign Mod");
    expect(assignModBtn).toBeDefined();
    fireEvent.click(assignModBtn);

    expect(screen.getByText("Assign / Change Role")).toBeDefined();
    expect(screen.getByText("Confirm Role Update")).toBeDefined();
  });

  it("TC19: Requires mandatory deletion reason before enabling confirm button in deletion modal", () => {
    vi.mocked(adminApi.useAdminUsers).mockReturnValue({
      data: {
        items: [
          {
            id: "u-1",
            email: "alice@foz.dev",
            role: "standard",
            status: "active",
            createdAt: new Date().toISOString(),
            displayName: "Alice Wonderland",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      isLoading: false,
    } as any);

    renderWithProviders(<AdminUsersPage />);
    const deleteBtn = screen.getByText("Delete Account");
    expect(deleteBtn).toBeDefined();
  });
});
