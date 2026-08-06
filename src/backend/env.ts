import "dotenv/config";
import { z } from "zod";

if (process.env.NODE_ENV === "test" && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

const boolish = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

const cleanString = z
  .string()
  .optional()
  .transform((v) => (v ? v.replace(/^["']|["']$/g, "").trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_ACCESS_TTL_MIN: z.coerce.number().int().positive().default(15),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(12),
  COOKIE_SECURE: boolish,
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  AI_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: cleanString,
  GOOGLE_CLIENT_SECRET: cleanString,
  GOOGLE_CALLBACK_URL: cleanString.transform((v) => v || "http://localhost:4000/api/v1/auth/google/callback"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof schema>;
