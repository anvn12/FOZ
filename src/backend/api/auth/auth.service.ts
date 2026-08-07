import { env } from "#backend/env";
import { hashPassword, verifyPassword } from "#backend/lib/password.js";
import { signAccessToken } from "#backend/lib/jwt.js";
import {
  findUserByEmail,
  findUserByUsername,
  getUserById,
  createUserWithProfile,
  updatePasswordHash,
  issueRefreshToken,
  hashRefreshSecret,
  createRefreshSession,
  findValidRefreshSession,
  revokeRefreshSession,
  toPublicUser,
  type PublicUser,
} from "#backend/db/repositories/users.js";
import type { AuthResponse, RefreshResponse } from "#shared/schemas/auth.js";

export class AuthError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
export class DuplicateEmailError extends AuthError {
  constructor() {
    super("EMAIL_TAKEN", 409);
  }
}
export class DuplicateUsernameError extends AuthError {
  constructor() {
    super("USERNAME_TAKEN", 409);
  }
}
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("INVALID_CREDENTIALS", 401);
  }
}
export class AccountNotActiveError extends AuthError {
  constructor() {
    super("ACCOUNT_NOT_ACTIVE", 403);
  }
}
export class InvalidRefreshError extends AuthError {
  constructor() {
    super("INVALID_REFRESH", 401);
  }
}

export type RefreshCookie = { id: string; secret: string } | null;

export function parseRefreshCookie(raw: string | undefined): RefreshCookie {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot < 0) return null;
  return { id: raw.slice(0, dot), secret: raw.slice(dot + 1) };
}

export function refreshCookiePayload(issued: { id: string; secret: string }): string {
  return `${issued.id}.${issued.secret}`;
}

export const REFRESH_COOKIE_NAME = "refresh_token";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    path: "/api/v1/auth",
    maxAge: env.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function clearRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    path: "/api/v1/auth",
    maxAge: 0,
  };
}

type Session = {
  auth: AuthResponse | RefreshResponse;
  cookie: { name: string; value: string; options: ReturnType<typeof refreshCookieOptions> };
};

async function issueFullSession(user: {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
}): Promise<Session> {
  const issued = issueRefreshToken(env.REFRESH_TTL_DAYS);
  await createRefreshSession({
    id: issued.id,
    userAccountId: user.id,
    tokenHash: hashRefreshSecret(issued.secret),
    expiresAt: issued.expiresAt,
  });
  const accessToken = signAccessToken({ sub: user.id, role: user.role, status: user.status });
  return {
    auth: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as PublicUser["role"],
        status: user.status as PublicUser["status"],
      },
      accessToken,
    },
    cookie: {
      name: REFRESH_COOKIE_NAME,
      value: refreshCookiePayload(issued),
      options: refreshCookieOptions(),
    },
  };
}

export async function register(input: { 
  email: string; 
  password: string;
  username: string;
  displayName?: string;
  location?: string;
  website?: string;
}): Promise<Session> {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) throw new DuplicateEmailError();
  const existingUsername = await findUserByUsername(input.username);
  if (existingUsername) throw new DuplicateUsernameError();
  const passwordHash = await hashPassword(input.password);
  const { user } = await createUserWithProfile({
    email: input.email,
    username: input.username,
    passwordHash,
    displayName: input.displayName || input.username,
    location: input.location,
    website: input.website,
  });
  return issueFullSession(user);
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  const user = await findUserByEmail(input.email);
  if (!user) throw new InvalidCredentialsError();
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new InvalidCredentialsError();
  if (user.status !== "active") throw new AccountNotActiveError();
  return issueFullSession(user);
}

export async function refresh(cookie: RefreshCookie): Promise<Session> {
  if (!cookie) throw new InvalidRefreshError();
  const tokenHash = hashRefreshSecret(cookie.secret);
  const session = await findValidRefreshSession(cookie.id, tokenHash);
  if (!session) throw new InvalidRefreshError();
  const user = await getUserById(session.userAccountId);
  if (!user || user.status !== "active") throw new AccountNotActiveError();
  await revokeRefreshSession(session.id);
  const issued = issueRefreshToken(env.REFRESH_TTL_DAYS);
  await createRefreshSession({
    id: issued.id,
    userAccountId: user.id,
    tokenHash: hashRefreshSecret(issued.secret),
    expiresAt: issued.expiresAt,
  });
  const accessToken = signAccessToken({ sub: user.id, role: user.role, status: user.status });
  return {
    auth: { accessToken, user: toPublicUser(user) },
    cookie: {
      name: REFRESH_COOKIE_NAME,
      value: refreshCookiePayload(issued),
      options: refreshCookieOptions(),
    },
  };
}

export async function logout(cookie: RefreshCookie): Promise<{ ok: true }> {
  if (cookie) {
    const tokenHash = hashRefreshSecret(cookie.secret);
    const session = await findValidRefreshSession(cookie.id, tokenHash);
    if (session) await revokeRefreshSession(session.id);
  }
  return { ok: true };
}

export async function changePassword(args: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await getUserById(args.userId);
  if (!user) throw new InvalidCredentialsError();
  const ok = await verifyPassword(args.currentPassword, user.passwordHash);
  if (!ok) throw new InvalidCredentialsError();
  const newHash = await hashPassword(args.newPassword);
  await updatePasswordHash(user.id, newHash);
  return { ok: true };
}
