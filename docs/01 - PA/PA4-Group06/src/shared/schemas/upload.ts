import { z } from "zod";

export const CloudinaryAssetSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  resourceType: z.enum(["image", "raw", "video"]).default("image"),
  createdAt: z.string(),
});

export type CloudinaryAsset = z.infer<typeof CloudinaryAssetSchema>;

export const SingleUploadResponseSchema = z.object({
  success: z.literal(true),
  data: CloudinaryAssetSchema,
});

export type SingleUploadResponse = z.infer<typeof SingleUploadResponseSchema>;

export const CloudinaryDeleteResponseSchema = z.object({
  success: z.literal(true),
  result: z.string(),
});

export type CloudinaryDeleteResponse = z.infer<typeof CloudinaryDeleteResponseSchema>;
