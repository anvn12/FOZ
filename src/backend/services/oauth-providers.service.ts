import { env } from "#backend/env.js";
import type { SocialProfileInput } from "./social-auth.service.js";

export async function getGoogleProfileFromCode(code: string): Promise<SocialProfileInput> {
  const allowMock = env.NODE_ENV !== "production";
  const missingCredentials = !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET;

  // Mock codes and the missing-credentials fallback are dev/test-only: a
  // "mock_" code must never authenticate a real account in production.
  if (allowMock && (code.startsWith("mock_") || missingCredentials)) {
    return {
      provider: "google",
      providerUserId: code === "mock_google_code" ? "google_user_123" : `google_${code}`,
      email: "google.user@example.com",
      displayName: "Google User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    };
  }

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  // 1. Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Google token exchange failed:", tokenRes.status);
    throw new Error("Failed to exchange authorization code with Google");
  }

  const tokens = (await tokenRes.json()) as { access_token: string; id_token?: string };

  // 2. Fetch user profile with access token
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  const profile = (await userInfoRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  return {
    provider: "google",
    providerUserId: profile.sub,
    email: profile.email,
    displayName: profile.name || profile.email?.split("@")[0] || "Google User",
    avatarUrl: profile.picture,
  };
}
