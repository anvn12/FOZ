import bcrypt from "bcrypt";
import type { Db } from "../client.js";
import { sql } from "drizzle-orm";

/**
 * Fast bcrypt hash helper using cost factor 4 for test performance.
 */
export async function hashPassword(password: string, cost = 4): Promise<string> {
  return bcrypt.hash(password, cost);
}

/**
 * Precomputes password hashes for faster bulk seeding.
 */
export async function getStandardPasswordHashes() {
  const [adminHash, modHash, userHash] = await Promise.all([
    hashPassword("admin@admin.foz", 4),
    hashPassword("mod@mod.foz", 4),
    hashPassword("password123", 4),
  ]);

  return {
    adminHash,
    modHash,
    userHash,
  };
}

/**
 * Clears all tables with CASCADE in topological reverse order.
 */
export async function truncateAllTables(db: Db): Promise<void> {
  await db.execute(sql`
    TRUNCATE TABLE 
      post_summaries,
      post_attachments,
      reactions,
      reports,
      comments,
      post_hashtags,
      hashtags,
      posts,
      profiles,
      user_social_links,
      admin_audit_logs,
      refresh_sessions,
      user_accounts
    CASCADE;
  `);
}

/**
 * Seeded PRNG for deterministic pseudo-random generations.
 */
export function createRng(seed = 42) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Generates dates distributed backwards from now over a given number of days.
 */
export function getDistributedDate(daysAgoMin: number, daysAgoMax: number, rng: () => number): Date {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysAgo = daysAgoMin + rng() * (daysAgoMax - daysAgoMin);
  return new Date(now - daysAgo * dayMs);
}
