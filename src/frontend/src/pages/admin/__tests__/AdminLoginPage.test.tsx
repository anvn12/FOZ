// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/utils";
import { AdminLoginPage } from "../AdminLoginPage";
import * as authApi from "../../../api/auth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the synced AuthLayout admin login interface", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<AdminLoginPage />);

    expect(screen.getByText(/Admin Control Login/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Admin Email address/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Log in to Admin Control/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Log in to standard portal instead/i })).toBeTruthy();
  });

  it("renders hero brand text on desktop view", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<AdminLoginPage />);

    expect(screen.getAllByText(/Focus on/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Control\./i).length).toBeGreaterThan(0);
  });

  it("submits admin login form successfully and navigates to /admin", async () => {
    const mockMutate = vi.fn((payload, options) => {
      options?.onSuccess?.({
        user: { id: "admin-1", email: payload.email, role: "administrator" },
        accessToken: "admin-token",
      });
    });
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderWithProviders(<AdminLoginPage />);

    const emailInput = screen.getByPlaceholderText(/Admin Email address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "admin@foz.dev" } });
    fireEvent.change(passwordInput, { target: { value: "AdminSecret123!" } });

    const submitBtn = screen.getByRole("button", { name: /Log in to Admin Control/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
    });
  });

  it("toggles password visibility when eye icon is clicked", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<AdminLoginPage />);

    const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /Show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe("text");

    const hideToggleBtn = screen.getByRole("button", { name: /Hide password/i });
    fireEvent.click(hideToggleBtn);

    expect(passwordInput.type).toBe("password");
  });
});
