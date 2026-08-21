// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ComponentProps } from "react";
import { GuestLoginModal, GUEST_LOGIN_PROMPT_KEY } from "../GuestLoginModal.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderModal(props: Partial<ComponentProps<typeof GuestLoginModal>> = {}) {
  return render(
    <MemoryRouter>
      <GuestLoginModal open onClose={() => {}} {...props} />
    </MemoryRouter>,
  );
}

describe("GuestLoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== "undefined" && typeof localStorage.clear === "function") {
      localStorage.clear();
    }
  });

  it("renders default title and description", () => {
    renderModal();
    expect(screen.getByText("Join FOZ")).toBeDefined();
    expect(screen.getByText(/Log in to follow people/)).toBeDefined();
  });

  it("renders custom title and description (post page usage)", () => {
    renderModal({
      title: "Log in to leave a comment",
      description: "You need to be logged in to comment on or reply to posts.",
    });
    expect(screen.getByText("Log in to leave a comment")).toBeDefined();
    expect(screen.getByText(/You need to be logged in to comment/)).toBeDefined();
  });

  it("persists dismissal by default (home page behavior)", () => {
    renderModal();
    fireEvent.click(screen.getByText("Not now"));
    expect(localStorage.getItem(GUEST_LOGIN_PROMPT_KEY)).toBe("1");
  });

  it("does not persist dismissal when persistDismissal=false (post page behavior)", () => {
    renderModal({ persistDismissal: false });
    fireEvent.click(screen.getByText("Not now"));
    expect(localStorage.getItem(GUEST_LOGIN_PROMPT_KEY)).toBeNull();
  });

  it("navigates to login when Log in is clicked", () => {
    renderModal();
    fireEvent.click(screen.getByText("Log in"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to register when Create account is clicked", () => {
    renderModal();
    fireEvent.click(screen.getByText("Create account"));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
