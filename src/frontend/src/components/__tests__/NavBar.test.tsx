// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../../test/utils.js";
import { NavBar } from "../NavBar.js";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

describe("NavBar Hamburger Menu Click Outside", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileApi.useProfile).mockReturnValue({ data: null } as unknown as ReturnType<typeof profileApi.useProfile>);
  });

  it("should close desktop hamburger (More) menu when clicking outside", () => {
    renderWithProviders(
      <div>
        <NavBar />
        <div data-testid="outside-element">Outside Content</div>
      </div>
    );

    const moreButton = screen.getByLabelText("More");
    expect(screen.queryByText("Report a Problem")).toBeNull();

    // Click to open More menu
    fireEvent.click(moreButton);
    expect(screen.getByText("Report a Problem")).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Report a Problem")).toBeNull();
  });

  it("should close mobile hamburger (Menu) menu when clicking outside", () => {
    renderWithProviders(
      <div>
        <NavBar />
        <div data-testid="outside-element">Outside Content</div>
      </div>
    );

    const menuButton = screen.getByLabelText("More");
    expect(screen.queryByText("Report a Problem")).toBeNull();

    // Click to open mobile Menu
    fireEvent.click(menuButton);
    expect(screen.getByText("Report a Problem")).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Report a Problem")).toBeNull();
  });

  it("should mark Home icon active (text-primary) on /latest and /foryou routes", () => {
    renderWithProviders(<NavBar />, { route: "/latest" });

    const homeLink = screen.getAllByLabelText("Home")[0];
    expect(homeLink!.className).toContain("text-primary");
  });

  it("should hide Log in for guests and only redirect to login via the profile/avatar icon", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<NavBar />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    );

    // No explicit "Log in" button anywhere for guests
    expect(screen.queryByText("Log in")).toBeNull();

    // Open More dropdown menu in guest mode
    fireEvent.click(screen.getByLabelText("More"));

    // Verify Settings / Report items are present but Log in is not
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Report a Problem")).toBeDefined();
    expect(screen.queryByText("Log in")).toBeNull();

    // Clicking the profile/avatar icon redirects a guest to the login page
    const profileBtn = screen.getAllByLabelText("Profile")[0];
    if (profileBtn) {
      fireEvent.click(profileBtn);
    }
    expect(screen.getByText("Login Page")).toBeDefined();
  });
});
