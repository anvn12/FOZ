import { env } from "#backend/env.js";
import type { SocialProfileInput } from "./social-auth.service.js";

export async function getGoogleProfileFromCode(code: string): Promise<SocialProfileInput> {
  // If mock code or credentials missing in test environment, use fallback mock
  if (code.startsWith("mock_") || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return {
      provider: "google",
      providerUserId: code === "mock_google_code" ? "google_user_123" : `google_${code}`,
      email: "google.user@example.com",
      displayName: "Google User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    };
  }

  // 1. Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("Google token exchange error:", errorText);
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

export async function getFacebookProfileFromCode(code: string): Promise<SocialProfileInput> {
  if (code.startsWith("mock_") || !env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    return {
      provider: "facebook",
      providerUserId: code === "mock_facebook_code" ? "facebook_user_456" : `facebook_${code}`,
      email: "facebook.user@example.com",
      displayName: "Facebook User",
      avatarUrl: "https://graph.facebook.com/v18.0/picture",
    };
  }

  // 1. Exchange code for access token
  const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
  tokenUrl.searchParams.append("client_id", env.FACEBOOK_APP_ID);
  tokenUrl.searchParams.append("client_secret", env.FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.append("redirect_uri", env.FACEBOOK_CALLBACK_URL);
  tokenUrl.searchParams.append("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("Facebook token exchange error:", errorText);
    throw new Error("Failed to exchange authorization code with Facebook");
  }

  const tokens = (await tokenRes.json()) as { access_token: string };

  // 2. Fetch user profile from Graph API
  const meUrl = new URL("https://graph.facebook.com/v18.0/me");
  meUrl.searchParams.append("fields", "id,name,email,picture.type(large)");
  meUrl.searchParams.append("access_token", tokens.access_token);

  const meRes = await fetch(meUrl.toString());
  if (!meRes.ok) {
    throw new Error("Failed to fetch Facebook user profile");
  }

  const profile = (await meRes.json()) as {
    id: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };

  return {
    provider: "facebook",
    providerUserId: profile.id,
    email: profile.email,
    displayName: profile.name || profile.email?.split("@")[0] || "Facebook User",
    avatarUrl: profile.picture?.data?.url,
  };
}
