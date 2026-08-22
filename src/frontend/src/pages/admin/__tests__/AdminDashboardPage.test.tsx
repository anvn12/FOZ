// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "#frontend/test/utils";
import { AdminDashboardPage } from "../AdminDashboardPage";
import * as adminApi from "#frontend/api/admin";

vi.mock("#frontend/api/admin", async () => {
  const actual = await vi.importActual("#frontend/api/admin");
  return {
    ...actual,
    useAdminMetrics: vi.fn(),
    useAuditLogs: vi.fn(),
  };
});

describe("AdminDashboardPage Component (TC8)", () => {
  it("TC8: Renders metric cards with loading state", () => {
    vi.mocked(adminApi.useAdminMetrics).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    vi.mocked(adminApi.useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByText("Dashboard Overview")).toBeDefined();
    expect(screen.getByText("TOTAL USERS")).toBeDefined();
    expect(screen.getByText("ACTIVE MODERATORS")).toBeDefined();
    expect(screen.getByText("PENDING REPORTS")).toBeDefined();
  });

  it("TC8: Renders metric numbers and audit activity when data is loaded", () => {
    vi.mocked(adminApi.useAdminMetrics).mockReturnValue({
      data: {
        totalUsers: 1250,
        activeModerators: 8,
        pendingEscalations: 3,
        contentRemoved24h: 12,
        aiStatus: "healthy",
        dailyActivity: [
          { day: "Mon", date: "Aug 1", count: 10 },
          { day: "Tue", date: "Aug 2", count: 25 },
          { day: "Wed", date: "Aug 3", count: 18 },
        ],
      },
      isLoading: false,
    } as any);

    vi.mocked(adminApi.useAuditLogs).mockReturnValue({
      data: {
        items: [
          {
            id: "1",
            actorName: "admin@foz.dev",
            actorRole: "administrator",
            actionType: "ROLE_CHANGE",
            targetType: "USER",
            targetId: "user-123",
            rationale: "Assigned moderator role",
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      },
      isLoading: false,
    } as any);

    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByText("1,250")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText((content) => content.includes("ROLE_CHANGE"))).toBeDefined();
  });
});
