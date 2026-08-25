// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import { SocialLoginButtons } from "../../components/SocialLoginButtons";
import { LoginPage } from "../LoginPage";
import * as authApi from "../../api/auth";

describe("SocialLoginButtons & Social Auth Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders full-width Google brand button with ARIA labels", () => {
    const handleSelect = vi.fn();
    renderWithProviders(<SocialLoginButtons onSelectProvider={handleSelect} />);

    const googleBtn = screen.getByRole("button", { name: /Continue with Google account/i });

    expect(googleBtn).toBeTruthy();
    expect(screen.getByText("Continue with Google")).toBeTruthy();

    fireEvent.click(googleBtn);
    expect(handleSelect).toHaveBeenCalledWith("google");
  });

  it("displays loading spinner state when social login is in progress", () => {
    renderWithProviders(
      <SocialLoginButtons onSelectProvider={vi.fn()} loadingProvider="google" />,
    );

    const googleBtn = screen.getByRole("button", { name: /Continue with Google account/i });
    expect(googleBtn.getAttribute("disabled")).toBe("");
  });

  it("renders Google social login button inside LoginPage", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("button", { name: /Continue with Google account/i })).toBeTruthy();
  });
});
