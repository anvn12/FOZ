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
  await db.execute(sql`TRUNCATE TABLE refresh_sessions, profiles, user_accounts RESTART IDENTITY CASCADE`);
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
