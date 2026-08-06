import { z } from "zod";

export const socialProviderEnum = z.enum(["google", "facebook"]);
export type SocialProvider = z.infer<typeof socialProviderEnum>;

export const socialAuthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});

export type SocialAuthCallbackInput = z.infer<typeof socialAuthCallbackSchema>;

export const socialAuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

export const socialAuthResponseSchema = z.object({
  accessToken: z.string(),
  user: socialAuthUserSchema,
});

export type SocialAuthResponse = z.infer<typeof socialAuthResponseSchema>;
