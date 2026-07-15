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

export const RegisterRequest = z.object({
  email: emailSchema,
  password: passwordSchema,
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
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>;

export const AuthResponse = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string(),
    role: z.enum(["guest", "standard", "moderator", "administrator"]),
    status: z.enum(["active", "suspended", "banned", "pending"]),
  }),
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const RefreshResponse = z.object({
  accessToken: z.string(),
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
