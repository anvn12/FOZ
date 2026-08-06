import { eq, and, isNull, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles, refreshSessions } from "#backend/db/schema/index.js";

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.email, email.trim().toLowerCase()));
  return row;
}

export async function getUserById(id: string) {
  const [row] = await db.select().from(userAccounts).where(eq(userAccounts.id, id));
  return row;
}

export async function createUserWithProfile(args: {
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  location?: string;
  website?: string;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(userAccounts)
      .values({
        email: args.email.trim().toLowerCase(),
        passwordHash: args.passwordHash,
        role: "standard",
        status: "active",
      })
      .returning();
    if (!user) throw new Error("Failed to create user");
    const [profile] = await tx
      .insert(profiles)
      .values({ 
        userAccountId: user.id, 
        username: args.username,
        displayName: args.displayName,
        location: args.location,
        website: args.website 
      })
      .returning();
    return { user, profile: profile! };
  });
}

export async function updatePasswordHash(id: string, passwordHash: string) {
  const [row] = await db
    .update(userAccounts)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(userAccounts.id, id))
    .returning();
  return row;
}

// Refresh session: opaque id + secret. The cookie carries `${id}.${secret}`.
// Only the SHA-256 of the secret is stored.
export type IssuedRefresh = { id: string; secret: string; expiresAt: Date };

export function issueRefreshToken(ttlDays: number): IssuedRefresh {
  const id = randomUUID();
  const secret = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  return { id, secret, expiresAt };
}

export function hashRefreshSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export async function createRefreshSession(args: {
  id: string;
  userAccountId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const [row] = await db.insert(refreshSessions).values(args).returning();
  return row!;
}

export async function findValidRefreshSession(id: string, tokenHash: string) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(refreshSessions)
    .where(
      and(
        eq(refreshSessions.id, id),
        eq(refreshSessions.tokenHash, tokenHash),
        isNull(refreshSessions.revokedAt),
        gt(refreshSessions.expiresAt, now),
      ),
    );
  return row;
}

export async function revokeRefreshSession(id: string) {
  const [row] = await db
    .update(refreshSessions)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(refreshSessions.id, id))
    .returning();
  return row;
}

export type PublicUser = {
  id: string;
  email: string;
  role: "guest" | "standard" | "moderator" | "administrator";
  status: "active" | "suspended" | "banned" | "pending";
};

export function toPublicUser(user: { id: string; email: string; role: string; status: string }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role as PublicUser["role"],
    status: user.status as PublicUser["status"],
  };
}
