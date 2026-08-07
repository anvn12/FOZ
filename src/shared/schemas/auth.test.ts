import { describe, it, expect } from "vitest";
import { RegisterRequest, LoginRequest, ChangePasswordRequest, usernameSchema } from "./auth.js";

const GOOD_EMAIL = "alice" + "@" + "example.com";
const GOOD_USERNAME = "alice_user";

describe("usernameSchema", () => {
  it("accepts valid usernames", () => {
    expect(usernameSchema.safeParse("alice_123").success).toBe(true);
    expect(usernameSchema.safeParse("bob.smith").success).toBe(true);
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects usernames longer than 30 characters", () => {
    expect(usernameSchema.safeParse("a".repeat(31)).success).toBe(false);
  });

  it("rejects usernames with invalid characters", () => {
    expect(usernameSchema.safeParse("alice!").success).toBe(false);
    expect(usernameSchema.safeParse("alice user").success).toBe(false);
  });

  it("rejects reserved usernames", () => {
    expect(usernameSchema.safeParse("admin").success).toBe(false);
    expect(usernameSchema.safeParse("moderator").success).toBe(false);
  });
});

describe("RegisterRequest", () => {
  it("accepts a valid email, username, and 8+ char password", () => {
    const r = RegisterRequest.safeParse({ email: GOOD_EMAIL, username: GOOD_USERNAME, password: "abcdefgh" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = RegisterRequest.safeParse({ email: "not-an-email", username: GOOD_USERNAME, password: "abcdefgh" });
    expect(r.success).toBe(false);
  });

  it("rejects a short password", () => {
    const r = RegisterRequest.safeParse({ email: GOOD_EMAIL, username: GOOD_USERNAME, password: "short" });
    expect(r.success).toBe(false);
  });

  it("normalizes email to lowercase", () => {
    const r = RegisterRequest.safeParse({
      email: "  ALICE" + "@" + "Example.COM  ",
      username: GOOD_USERNAME,
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
