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

  it("renders stacked Google and Facebook brand buttons with ARIA labels and OR divider", () => {
    const handleSelect = vi.fn();
    renderWithProviders(<SocialLoginButtons onSelectProvider={handleSelect} />);

    const googleBtn = screen.getByRole("button", { name: /Continue with Google account/i });
    const facebookBtn = screen.getByRole("button", { name: /Continue with Facebook account/i });

    expect(googleBtn).toBeTruthy();
    expect(facebookBtn).toBeTruthy();
    expect(screen.getByText(/or continue with/i)).toBeTruthy();

    fireEvent.click(googleBtn);
    expect(handleSelect).toHaveBeenCalledWith("google");

    fireEvent.click(facebookBtn);
    expect(handleSelect).toHaveBeenCalledWith("facebook");
  });

  it("displays loading spinner state when social login is in progress", () => {
    renderWithProviders(
      <SocialLoginButtons onSelectProvider={vi.fn()} loadingProvider="google" />,
    );

    const googleBtn = screen.getByRole("button", { name: /Continue with Google account/i });
    expect(googleBtn.getAttribute("disabled")).toBe("");
  });

  it("renders social login buttons inside LoginPage", () => {
    vi.spyOn(authApi, "useLogin").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("button", { name: /Continue with Google account/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continue with Facebook account/i })).toBeTruthy();
  });
});
