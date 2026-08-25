// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { NavBar } from "../NavBar.js";
import { useAuthStore } from "#frontend/stores/auth";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

describe("NavBar (shadcn sidebar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, status: "guest" });
    vi.mocked(profileApi.useProfile).mockReturnValue({ data: null } as unknown as ReturnType<
      typeof profileApi.useProfile
    >);
  });

  it("renders the sidebar navigation items and more actions for guests", () => {
    renderWithProviders(<NavBar />);

    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Search")).toBeDefined();
    expect(screen.getByText("Create")).toBeDefined();
    expect(screen.getByText("Profile")).toBeDefined();

    // Guests do not get a Log in button or a Log out action
    expect(screen.queryByText("Log in")).toBeNull();
    expect(screen.queryByText("Log out")).toBeNull();

    // The More menu provides Settings / Feedback
    fireEvent.pointerDown(screen.getByText("More"));
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Feedback")).toBeDefined();

    // Clicking Feedback opens the FeedbackDialog
    fireEvent.click(screen.getByText("Feedback"));
    expect(screen.getByText("Send Us Feedback")).toBeDefined();
  });

  it("shows Log out only for authenticated users", () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });
    renderWithProviders(<NavBar />);

    fireEvent.pointerDown(screen.getByText("More"));
    expect(screen.getByText("Log out")).toBeDefined();
  });

  it("marks the Home item active on /latest and /foryou routes", () => {
    renderWithProviders(<NavBar />, { route: "/latest" });

    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    expect(homeLinks.some((link) => link.getAttribute("data-active") === "true")).toBe(true);
  });

  it("shows the login modal when a guest clicks Profile", () => {
    renderWithProviders(<NavBar />);

    const profileBtn = screen.getAllByRole("button", { name: "Profile" })[0];
    if (profileBtn) {
      fireEvent.click(profileBtn);
    }
    expect(screen.getByText("Log in to view your profile")).toBeDefined();
  });

  it("shows the login modal when a guest clicks Create", () => {
    renderWithProviders(<NavBar />);

    const createBtn = screen.getAllByRole("button", { name: "Create" })[0];
    if (createBtn) {
      fireEvent.click(createBtn);
    }
    expect(screen.getByText("Log in to create a post")).toBeDefined();
  });

  it("renders the floating create button for desktop only", () => {
    renderWithProviders(<NavBar />);

    const fab = screen.getByRole("button", { name: "Create post" });
    // Hidden on mobile, visible from md breakpoint up
    expect(fab.className).toContain("hidden");
    expect(fab.className).toContain("md:flex");
  });

  it("opens the create post modal for authenticated users via the Create item", () => {
    useAuthStore.setState({
      user: { id: "user-id", email: "alice@test.com", role: "standard", status: "active" },
      accessToken: "mock-token",
    });
    renderWithProviders(<NavBar />);

    const createBtn = screen.getAllByRole("button", { name: "Create" })[0];
    if (createBtn) {
      fireEvent.click(createBtn);
    }
    expect(screen.getByText("Create Post")).toBeDefined();
  });
});
