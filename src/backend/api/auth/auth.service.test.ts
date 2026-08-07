import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("#backend/db/repositories/users.js", () => ({
  findUserByEmail: vi.fn(),
  findUserByUsername: vi.fn(),
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
  login,
  logout,
  refresh,
  changePassword,
  DuplicateEmailError,
  InvalidCredentialsError,
  AccountNotActiveError,
  InvalidRefreshError,
} from "#backend/api/auth/auth.service.js";
import {
  findUserByEmail,
  findUserByUsername,
  createUserWithProfile,
  createRefreshSession,
  issueRefreshToken,
  findValidRefreshSession,
  revokeRefreshSession,
  getUserById,
  hashRefreshSecret,
  updatePasswordHash,
} from "#backend/db/repositories/users.js";
import { verifyPassword, hashPassword } from "#backend/lib/password.js";

const mockedFindUserByEmail = vi.mocked(findUserByEmail);
const mockedFindUserByUsername = vi.mocked(findUserByUsername);
const mockedCreateUserWithProfile = vi.mocked(createUserWithProfile);
const mockedCreateRefreshSession = vi.mocked(createRefreshSession);
const mockedIssueRefreshToken = vi.mocked(issueRefreshToken);
const mockedVerifyPassword = vi.mocked(verifyPassword);
const mockedFindValidRefreshSession = vi.mocked(findValidRefreshSession);
const mockedRevokeRefreshSession = vi.mocked(revokeRefreshSession);
const mockedHashRefreshSecret = vi.mocked(hashRefreshSecret);
const mockedGetUserById = vi.mocked(getUserById);
const mockedUpdatePasswordHash = vi.mocked(updatePasswordHash);
const mockedHashPassword = vi.mocked(hashPassword);

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
    mockedFindUserByUsername.mockResolvedValue(undefined);
    mockedCreateUserWithProfile.mockResolvedValue({
      user: {
        id: "u1",
        email: "[email protected]",
        username: "testuser",
        role: "standard",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: "ignored",
      },
      profile: { id: "p1", userAccountId: "u1", displayName: "u1", bio: null, avatarUrl: null, location: null, website: null, createdAt: new Date(), updatedAt: new Date() },
    });

    const session = await register({ email: "[email protected]", username: "testuser", password: "abcdefgh" });

    // register() returns the full AuthResponse (user + accessToken)
    const auth = session.auth as { user: { id: string; email: string; username: string }; accessToken: string };
    expect(auth.user.id).toBe("u1");
    expect(auth.user.email).toBe("[email protected]");
    expect(auth.user.username).toBe("testuser");
    expect(auth.accessToken).toBe("access-token-mock");
    expect(session.cookie.name).toBe("refresh_token");
    expect(session.cookie.value).toBe("id-123.secret-456");
    expect(session.cookie.options.httpOnly).toBe(true);
    expect(session.cookie.options.sameSite).toBe("lax");
    expect(session.cookie.options.path).toBe("/api/v1/auth");
  });

  it("throws DuplicateEmailError when the email is already taken", async () => {
    mockedFindUserByEmail.mockResolvedValue({
      id: "existing",
      email: "[email protected]",
      username: "existinguser",
      passwordHash: "h",
      role: "standard",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    await expect(register({ email: "[email protected]", username: "testuser", password: "abcdefgh" })).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});

describe("auth.service.login (tier-1, mocked repo)", () => {
  const baseUser = {
    id: "u1",
    email: "alice" + "@" + "example.com",
    username: "alice",
    passwordHash: "hash:abcdefgh",
    role: "standard" as const,
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIssueRefreshToken.mockReturnValue({
      id: "id-xyz",
      secret: "secret-abc",
      expiresAt: new Date("2030-01-01T00:00:00Z"),
    });
    mockedCreateRefreshSession.mockResolvedValue({} as never);
  });

  it("happy path: returns AuthResponse + cookie", async () => {
    mockedFindUserByEmail.mockResolvedValue(baseUser as never);
    mockedVerifyPassword.mockResolvedValue(true);
    const session = await login({ email: baseUser.email, password: "abcdefgh" });
    const auth = session.auth as { user: { id: string; email: string }; accessToken: string };
    expect(auth.user.id).toBe("u1");
    expect(auth.accessToken).toBe("access-token-mock");
    expect(session.cookie.name).toBe("refresh_token");
    expect(session.cookie.value).toBe("id-xyz.secret-abc");
  });

  it("throws InvalidCredentialsError for unknown email", async () => {
    mockedFindUserByEmail.mockResolvedValue(undefined);
    await expect(login({ email: "nobody" + "@" + "nowhere.io", password: "abcdefgh" })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(mockedVerifyPassword).not.toHaveBeenCalled();
  });

  it("throws InvalidCredentialsError for wrong password (no enumeration)", async () => {
    mockedFindUserByEmail.mockResolvedValue(baseUser as never);
    mockedVerifyPassword.mockResolvedValue(false);
    await expect(login({ email: baseUser.email, password: "wrong-password" })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it.each(["suspended", "banned", "pending"] as const)(
    "throws AccountNotActiveError for status=%s",
    async (status) => {
      mockedFindUserByEmail.mockResolvedValue({ ...baseUser, status } as never);
      mockedVerifyPassword.mockResolvedValue(true);
      await expect(login({ email: baseUser.email, password: "abcdefgh" })).rejects.toBeInstanceOf(
        AccountNotActiveError,
      );
    },
  );
});

describe("auth.service.logout (tier-1, mocked repo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes the session matching the cookie and returns { ok: true }", async () => {
    mockedHashRefreshSecret.mockReturnValue("hashed-secret");
    mockedFindValidRefreshSession.mockResolvedValue({
      id: "session-id",
      userAccountId: "u1",
      tokenHash: "hashed-secret",
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockedRevokeRefreshSession.mockResolvedValue({} as never);

    const result = await logout({ id: "session-id", secret: "raw-secret" });
    expect(result).toEqual({ ok: true });
    expect(mockedFindValidRefreshSession).toHaveBeenCalledWith("session-id", "hashed-secret");
    expect(mockedRevokeRefreshSession).toHaveBeenCalledWith("session-id");
  });

  it("no-ops when no cookie is present", async () => {
    const result = await logout(null);
    expect(result).toEqual({ ok: true });
    expect(mockedFindValidRefreshSession).not.toHaveBeenCalled();
    expect(mockedRevokeRefreshSession).not.toHaveBeenCalled();
  });

  it("no-ops when the cookie is invalid (no matching session)", async () => {
    mockedHashRefreshSecret.mockReturnValue("hashed-secret");
    mockedFindValidRefreshSession.mockResolvedValue(undefined);
    const result = await logout({ id: "session-id", secret: "raw-secret" });
    expect(result).toEqual({ ok: true });
    expect(mockedRevokeRefreshSession).not.toHaveBeenCalled();
  });
});

describe("auth.service.refresh (tier-1, mocked repo)", () => {
  const validSession = {
    id: "session-id",
    userAccountId: "u1",
    tokenHash: "hashed-secret",
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const activeUser = {
    id: "u1",
    email: "alice" + "@" + "example.com",
    passwordHash: "h",
    role: "standard" as const,
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedIssueRefreshToken.mockReturnValue({
      id: "new-session-id",
      secret: "new-secret",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockedCreateRefreshSession.mockResolvedValue({} as never);
  });

  it("happy path: rotates the session and returns a new access token", async () => {
    mockedHashRefreshSecret.mockReturnValue("hashed-secret");
    mockedFindValidRefreshSession.mockResolvedValue(validSession as never);
    mockedGetUserById.mockResolvedValue(activeUser as never);
    mockedRevokeRefreshSession.mockResolvedValue({} as never);

    const session = await refresh({ id: "session-id", secret: "raw-secret" });
    expect(session.auth.accessToken).toBe("access-token-mock");
    expect(session.cookie.name).toBe("refresh_token");
    expect(session.cookie.value).toBe("new-session-id.new-secret");
    expect(mockedRevokeRefreshSession).toHaveBeenCalledWith("session-id");
    expect(mockedCreateRefreshSession).toHaveBeenCalled();
  });

  it("throws InvalidRefreshError when no cookie is present", async () => {
    await expect(refresh(null)).rejects.toBeInstanceOf(InvalidRefreshError);
  });

  it("throws InvalidRefreshError when the session is not found or expired", async () => {
    mockedHashRefreshSecret.mockReturnValue("hashed-secret");
    mockedFindValidRefreshSession.mockResolvedValue(undefined);
    await expect(refresh({ id: "session-id", secret: "raw" })).rejects.toBeInstanceOf(
      InvalidRefreshError,
    );
  });

  it("throws AccountNotActiveError when the user is no longer active", async () => {
    mockedHashRefreshSecret.mockReturnValue("hashed-secret");
    mockedFindValidRefreshSession.mockResolvedValue(validSession as never);
    mockedGetUserById.mockResolvedValue({ ...activeUser, status: "banned" } as never);
    await expect(refresh({ id: "session-id", secret: "raw" })).rejects.toBeInstanceOf(
      AccountNotActiveError,
    );
  });
});

describe("auth.service.changePassword (tier-1, mocked repo)", () => {
  const baseUser = {
    id: "u1",
    email: "alice" + "@" + "example.com",
    passwordHash: "old-hash",
    role: "standard" as const,
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedHashPassword.mockResolvedValue("new-hash");
    mockedUpdatePasswordHash.mockResolvedValue({} as never);
  });

  it("happy path: verifies current, hashes new, updates the row", async () => {
    mockedGetUserById.mockResolvedValue(baseUser as never);
    mockedVerifyPassword.mockResolvedValue(true);
    const result = await changePassword({ userId: "u1", currentPassword: "oldpass1234", newPassword: "newpass1234" });
    expect(result).toEqual({ ok: true });
    expect(mockedHashPassword).toHaveBeenCalledWith("newpass1234");
    expect(mockedUpdatePasswordHash).toHaveBeenCalledWith("u1", "new-hash");
  });

  it("throws InvalidCredentialsError when current password is wrong", async () => {
    mockedGetUserById.mockResolvedValue(baseUser as never);
    mockedVerifyPassword.mockResolvedValue(false);
    await expect(
      changePassword({ userId: "u1", currentPassword: "wrongoldpwd1", newPassword: "newpass1234" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(mockedUpdatePasswordHash).not.toHaveBeenCalled();
  });

  it("throws InvalidCredentialsError when the user does not exist", async () => {
    mockedGetUserById.mockResolvedValue(undefined);
    await expect(
      changePassword({ userId: "missing", currentPassword: "anything1", newPassword: "newpass1234" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
