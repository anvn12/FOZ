import { z } from "zod";

// NIST 800-63B-style: min 8 chars, no required character class, no upper cap,
// breached-list check (the breached-list check lives in the service layer).
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address"));

export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "moderator",
  "mod",
  "api",
  "support",
  "root",
  "null",
  "undefined",
  "foz",
  "system",
  "help",
  "about",
  "settings",
  "terms",
  "privacy",
];

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9._]+$/, "Username can only contain lowercase letters, numbers, underscores, and periods")
  .refine((val) => !RESERVED_USERNAMES.includes(val), "This username is reserved");

export const RegisterRequest = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  displayName: z.string().max(50, "Display name is too long").optional(),
  location: z.string().max(100, "Location is too long").optional(),
  website: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const LoginRequest = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const ChangePasswordRequest = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().optional(),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  })
  .refine((v) => !v.confirmNewPassword || v.newPassword === v.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>;

export const AuthResponse = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string(),
    username: z.string(),
    role: z.enum(["guest", "standard", "moderator", "administrator"]),
    status: z.enum(["active", "suspended", "banned", "pending"]),
  }),
  accessToken: z.string(),
  isNewUser: z.boolean().optional(),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const RefreshResponse = z.object({
  accessToken: z.string(),
  user: AuthResponse.shape.user,
});
export type RefreshResponse = z.infer<typeof RefreshResponse>;

export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;
