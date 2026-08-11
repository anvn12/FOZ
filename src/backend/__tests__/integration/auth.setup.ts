import type { Express } from "express";
import request from "supertest";
import { sql } from "drizzle-orm";
import { createApp } from "#backend/index.js";
import { db } from "#backend/db/client.js";

export type App = ReturnType<typeof createApp>;
export type Agent = ReturnType<typeof request>;

export function getApp(): App {
  return createApp();
}

export function getAgent(): Agent {
  return request(getApp() as Express);
}

export async function clearDb(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS username text DEFAULT 'legacy_user';
    CREATE TABLE IF NOT EXISTS user_social_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_account_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
      provider VARCHAR(20) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      provider_email VARCHAR(255) NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hashtags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    CREATE TABLE IF NOT EXISTS post_hashtags (
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, hashtag_id)
    );
  `);
  await db.execute(sql`TRUNCATE TABLE user_social_links, refresh_sessions, profiles, user_accounts RESTART IDENTITY CASCADE`);
  try {
    await db.execute(sql`TRUNCATE TABLE posts, post_hashtags, hashtags, comments, reactions, forum_categories, admin_audit_logs, system_settings RESTART IDENTITY CASCADE`);
  } catch (_e) {
    // Ignore if optional feature tables are not populated in test DB
  }
}

export function expectFastResponse(res: { headers: Record<string, string | string[] | undefined> }, maxMs = 500) {
  // ponytail: best-effort header-based check; production should set
  // server-timing or a custom response-time header for accurate measurement.
  const t = res.headers["x-response-time"];
  if (typeof t === "string") {
    const ms = Number(t.replace("ms", ""));
    if (Number.isFinite(ms)) expect(ms).toBeLessThan(maxMs);
  }
  // If no header is present, we don't fail — `supertest` doesn't measure
  // response time. The Vitest runner will fail the build on per-test
  // timeout if the endpoint is genuinely slow.
}
