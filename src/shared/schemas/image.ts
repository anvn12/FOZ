import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export const MAX_RAW_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_PROCESSED_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const DIMENSION_LIMITS = {
  feed_post: { maxWidth: 1600, maxHeight: 1600 },
  avatar: { maxWidth: 512, maxHeight: 512 },
} as const;

export const UploadTypeSchema = z.enum(["feed_post", "avatar"]);
export type UploadType = z.infer<typeof UploadTypeSchema>;

export const ImageUploadRequestSchema = z.object({
  uploadType: UploadTypeSchema,
  clientCompressed: z.boolean().optional().default(false),
});

export type ImageUploadRequest = z.infer<typeof ImageUploadRequestSchema>;

export const ImageAssetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  originalName: z.string(),
  originalSize: z.number().int().positive(),
  compressedSize: z.number().int().positive(),
  mimeType: z.literal("image/webp"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  uploadType: UploadTypeSchema,
  storagePath: z.string(),
  exifStripped: z.boolean(),
  createdAt: z.string(),
});

export type ImageAsset = z.infer<typeof ImageAssetSchema>;
