import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("#backend/db/repositories/users.js", () => ({
  findUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  createUserWithProfile: vi.fn(),
  updatePasswordHash: vi.fn(),
  issueRefreshToken: vi.fn(),
  hashRefreshSecret: vi.fn(),
  createRefreshSession: vi.fn(),
  findValidRefreshSession: vi.fn(),
  revokeRefreshSession: vi.fn(),
  toPublicUser: vi.fn(),
}));

vi.mock("#backend/lib/password.js", () => ({
  hashPassword: vi.fn(async (p: string) => `hash:${p}`),
  verifyPassword: vi.fn(),
}));

vi.mock("#backend/lib/jwt.js", () => ({
  signAccessToken: vi.fn(() => "access-token-mock"),
  verifyAccessToken: vi.fn(),
}));

import {
  register,
  DuplicateEmailError,
} from "#backend/api/auth/auth.service.js";
import { findUserByEmail, createUserWithProfile, createRefreshSession, issueRefreshToken } from "#backend/db/repositories/users.js";

const mockedFindUserByEmail = vi.mocked(findUserByEmail);
const mockedCreateUserWithProfile = vi.mocked(createUserWithProfile);
const mockedCreateRefreshSession = vi.mocked(createRefreshSession);
const mockedIssueRefreshToken = vi.mocked(issueRefreshToken);

describe("auth.service.register (tier-1, mocked repo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedIssueRefreshToken.mockReturnValue({
      id: "id-123",
      secret: "secret-456",
      expiresAt: new Date("2030-01-01T00:00:00Z"),
    });
    mockedCreateRefreshSession.mockResolvedValue({} as never);
  });

  it("creates a user, issues a refresh session, and returns AuthResponse + cookie", async () => {
    mockedFindUserByEmail.mockResolvedValue(undefined);
    mockedCreateUserWithProfile.mockResolvedValue({
      user: {
        id: "u1",
        email: "[email protected]",
        role: "standard",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: "ignored",
      },
      profile: { id: "p1", userAccountId: "u1", displayName: "u1", bio: null, avatarUrl: null, location: null, website: null, createdAt: new Date(), updatedAt: new Date() },
    });

    const session = await register({ email: "[email protected]", password: "abcdefgh" });

    // register() returns the full AuthResponse (user + accessToken)
    const auth = session.auth as { user: { id: string; email: string }; accessToken: string };
    expect(auth.user.id).toBe("u1");
    expect(auth.user.email).toBe("[email protected]");
    expect(auth.accessToken).toBe("access-token-mock");
    expect(session.cookie.name).toBe("refresh_token");
    expect(session.cookie.value).toBe("id-123.secret-456");
    expect(session.cookie.options.httpOnly).toBe(true);
    expect(session.cookie.options.sameSite).toBe("lax");
    expect(session.cookie.options.path).toBe("/auth");
  });

  it("throws DuplicateEmailError when the email is already taken", async () => {
    mockedFindUserByEmail.mockResolvedValue({
      id: "existing",
      email: "[email protected]",
      passwordHash: "h",
      role: "standard",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    await expect(register({ email: "[email protected]", password: "abcdefgh" })).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});
