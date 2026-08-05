// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import { RegisterPage } from "../RegisterPage";
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

describe("Auth Redirection Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /login route when register is successful", async () => {
    const mockMutate = vi.fn((payload, options) => {
      options?.onSuccess?.({ user: { id: "123", email: payload.email }, accessToken: "token" });
    });
    vi.spyOn(authApi, "useRegister").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderWithProviders(<RegisterPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByPlaceholderText("Create a password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    const submitBtn = screen.getByRole("button", { name: /Sign up/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("should redirect to / (root) route when login is successful", async () => {
    const mockMutate = vi.fn((payload, options) => {
      options?.onSuccess?.({ user: { id: "123", email: payload.email }, accessToken: "token" });
    });
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    const submitBtn = screen.getByRole("button", { name: /Log in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
