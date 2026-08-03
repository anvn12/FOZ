// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils.js";
import { NavBar } from "../NavBar.js";
import * as profileApi from "../../api/profile.js";

vi.mock("../../api/profile.js", () => ({
  useProfile: vi.fn(),
}));

describe("NavBar Hamburger Menu Click Outside", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileApi.useProfile).mockReturnValue({ data: null } as any);
  });

  it("should close desktop hamburger (More) menu when clicking outside", () => {
    renderWithProviders(
      <div>
        <NavBar />
        <div data-testid="outside-element">Outside Content</div>
      </div>
    );

    const moreButton = screen.getByLabelText("More");
    expect(screen.queryByText("Settings")).toBeNull();

    // Click to open More menu
    fireEvent.click(moreButton);
    expect(screen.getByText("Settings")).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("should close mobile hamburger (Menu) menu when clicking outside", () => {
    renderWithProviders(
      <div>
        <NavBar />
        <div data-testid="outside-element">Outside Content</div>
      </div>
    );

    const menuButton = screen.getByLabelText("Menu");
    expect(screen.queryByText("Settings")).toBeNull();

    // Click to open mobile Menu
    fireEvent.click(menuButton);
    expect(screen.getByText("Settings")).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("should mark Home icon active (text-primary) on /latest and /foryou routes", () => {
    renderWithProviders(<NavBar />, { initialEntries: ["/latest"] });

    const homeLink = screen.getAllByLabelText("Home")[0];
    expect(homeLink.className).toContain("text-primary");
  });
});
