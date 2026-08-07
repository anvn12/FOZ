// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, fireEvent } from "#frontend/test/utils";
import { AdminLayout } from "../AdminLayout";
import { useAuthStore } from "#frontend/stores/auth";

vi.mock("#frontend/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("AdminLayout Component", () => {
  it("renders sidebar navigation and top header", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      id: "admin-1",
      email: "admin@foz.dev",
      role: "administrator",
    });

    renderWithProviders(
      <AdminLayout>
        <div>Admin Dashboard Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("FOZ Admin")).toBeDefined();
    expect(screen.getByText("Moderation Queue")).toBeDefined();
    expect(screen.getByText("User Management")).toBeDefined();
    expect(screen.getByText("SYSTEM OPERATIONAL")).toBeDefined();
    expect(screen.getByText("Admin Dashboard Content")).toBeDefined();
  });

  it("opens Governance Help modal when '?' button is clicked", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      id: "admin-1",
      email: "admin@foz.dev",
      role: "administrator",
    });

    renderWithProviders(
      <AdminLayout>
        <div>Admin Dashboard Content</div>
      </AdminLayout>
    );

    const helpBtn = screen.getByTitle("Help & Platform Documentation");
    expect(helpBtn).toBeDefined();
    fireEvent.click(helpBtn);

    expect(screen.getByText("Administrator Governance Guide")).toBeDefined();
    expect(screen.getByText("What is the Administrator Control Center?")).toBeDefined();
    expect(screen.getByText("Close Guide")).toBeDefined();
  });
});
