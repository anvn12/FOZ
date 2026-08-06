import { eq, and } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { userAccounts, profiles, userSocialLinks } from "#backend/db/schema/index.js";
import {
  findUserByEmail,
  issueRefreshToken,
  hashRefreshSecret,
  createRefreshSession,
  toPublicUser,
} from "#backend/db/repositories/users.js";
import { signAccessToken } from "#backend/lib/jwt.js";
import { env } from "#backend/env.js";
import { REFRESH_COOKIE_NAME, refreshCookieOptions, refreshCookiePayload, AuthError } from "#backend/api/auth/auth.service.js";

export type SocialProfileInput = {
  provider: "google" | "facebook";
  providerUserId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
};

export async function findSocialLink(provider: string, providerUserId: string) {
  const [row] = await db
    .select()
    .from(userSocialLinks)
    .where(
      and(
        eq(userSocialLinks.provider, provider),
        eq(userSocialLinks.providerUserId, providerUserId),
      ),
    );
  return row;
}

export async function createSocialLink(args: {
  userAccountId: string;
  provider: string;
  providerUserId: string;
  providerEmail?: string;
}) {
  const [row] = await db
    .insert(userSocialLinks)
    .values({
      userAccountId: args.userAccountId,
      provider: args.provider,
      providerUserId: args.providerUserId,
      providerEmail: args.providerEmail,
    })
    .returning();
  return row!;
}

export async function processSocialAuth(input: SocialProfileInput) {
  const { provider, providerUserId, email, displayName, avatarUrl } = input;

  // 1. Check if social link exists
  const existingLink = await findSocialLink(provider, providerUserId);
  let userId: string;

  if (existingLink) {
    userId = existingLink.userAccountId;
  } else if (email) {
    // 2. Check if user exists by email
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      userId = existingUser.id;
      // Create social link mapping
      await createSocialLink({
        userAccountId: userId,
        provider,
        providerUserId,
        providerEmail: email,
      });
    } else {
      // 3. Create new user account and profile
      const result = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(userAccounts)
          .values({
            email: email.trim().toLowerCase(),
            passwordHash: "", // Passwordless social user
            role: "standard",
            status: "active",
          })
          .returning();

        if (!user) throw new Error("Failed to create user account");

        await tx.insert(profiles).values({
          userAccountId: user.id,
          displayName: displayName || email.split("@")[0],
          avatarUrl: avatarUrl || null,
        });

        await tx.insert(userSocialLinks).values({
          userAccountId: user.id,
          provider,
          providerUserId,
          providerEmail: email,
        });

        return user;
      });

      userId = result.id;
    }
  } else {
    // Generate a fallback synthetic user if no email provided by provider
    const syntheticEmail = `${provider}_${providerUserId}@social.foz.internal`;
    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(userAccounts)
        .values({
          email: syntheticEmail,
          passwordHash: "",
          role: "standard",
          status: "active",
        })
        .returning();

      if (!user) throw new Error("Failed to create synthetic user");

      await tx.insert(profiles).values({
        userAccountId: user.id,
        displayName: displayName || `${provider}User`,
        avatarUrl: avatarUrl || null,
      });

      await tx.insert(userSocialLinks).values({
        userAccountId: user.id,
        provider,
        providerUserId,
        providerEmail: syntheticEmail,
      });

      return user;
    });

    userId = result.id;
  }

  // Retrieve final user and profile data
  const [userRecord] = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, userId));

  if (!userRecord || userRecord.status !== "active") {
    throw new AuthError("ACCOUNT_NOT_ACTIVE", 403);
  }

  const [profileRecord] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userAccountId, userId));

  const publicUser = toPublicUser(userRecord, profileRecord || undefined);

  // Issue session tokens matching standard auth flow
  const accessToken = signAccessToken({
    sub: userRecord.id,
    role: userRecord.role,
  });

  const issuedRefresh = issueRefreshToken(env.REFRESH_TTL_DAYS);
  await createRefreshSession({
    id: issuedRefresh.id,
    userAccountId: userRecord.id,
    tokenHash: hashRefreshSecret(issuedRefresh.secret),
    expiresAt: issuedRefresh.expiresAt,
  });

  return {
    auth: {
      accessToken,
      user: publicUser,
    },
    cookie: {
      name: REFRESH_COOKIE_NAME,
      value: refreshCookiePayload(issuedRefresh),
      options: refreshCookieOptions(),
    },
  };
}
