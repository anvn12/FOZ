// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import { LoginPage } from "../LoginPage";
import * as authApi from "../../api/auth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage (Lumina Glassmorphic UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Lumina glassmorphic login interface", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/Log in to FOZ/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Email address or mobile number/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Log in/i })).toBeTruthy();
    expect(screen.getByText(/Forgotten password\?/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Create new account/i })).toBeTruthy();
  });

  it("renders hero brand text and carousel on desktop view", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/Focus on/i)).toBeTruthy();
    expect(screen.getByText(/Zillions\./i)).toBeTruthy();
    expect(screen.getByText(/Top 10 productivity hacks for 2024/i)).toBeTruthy();
  });

  it("advances carousel slide when navigation buttons are clicked", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    const nextButton = screen.getByRole("button", { name: /next slide/i });
    fireEvent.click(nextButton);

    expect(screen.getByText(/The rise of AI in fintech/i)).toBeTruthy();
  });

  it("submits login form successfully and navigates to home", async () => {
    const mockMutate = vi.fn((payload, options) => {
      options?.onSuccess?.({ user: { id: "123", email: payload.email }, accessToken: "token" });
    });
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/Email address or mobile number/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Secret123!" } });

    const submitBtn = screen.getByRole("button", { name: /Log in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
