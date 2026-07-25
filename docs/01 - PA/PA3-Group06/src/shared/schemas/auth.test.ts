import { describe, it, expect } from "vitest";
import { RegisterRequest, LoginRequest, ChangePasswordRequest } from "./auth.js";

const GOOD_EMAIL = "alice" + "@" + "example.com";

describe("RegisterRequest", () => {
  it("accepts a valid email and 8+ char password", () => {
    const r = RegisterRequest.safeParse({ email: GOOD_EMAIL, password: "abcdefgh" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = RegisterRequest.safeParse({ email: "not-an-email", password: "abcdefgh" });
    expect(r.success).toBe(false);
  });

  it("rejects a short password", () => {
    const r = RegisterRequest.safeParse({ email: GOOD_EMAIL, password: "short" });
    expect(r.success).toBe(false);
  });

  it("normalizes email to lowercase", () => {
    const r = RegisterRequest.safeParse({
      email: "  ALICE" + "@" + "Example.COM  ",
      password: "abcdefgh",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe(GOOD_EMAIL);
  });
});

describe("LoginRequest", () => {
  it("requires a non-empty password", () => {
    const r = LoginRequest.safeParse({ email: GOOD_EMAIL, password: "" });
    expect(r.success).toBe(false);
  });
});

describe("ChangePasswordRequest", () => {
  it("rejects newPassword equal to currentPassword", () => {
    const r = ChangePasswordRequest.safeParse({
      currentPassword: "samepassword",
      newPassword: "samepassword",
    });
    expect(r.success).toBe(false);
  });

  it("accepts different passwords meeting strength", () => {
    const r = ChangePasswordRequest.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword2",
    });
    expect(r.success).toBe(true);
  });
});
