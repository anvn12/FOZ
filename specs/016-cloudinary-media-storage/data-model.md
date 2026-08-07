# Phase 1: Data Model for Cloudinary Media Storage

## Key Entities & Schemas

### 1. Cloudinary Asset Metadata (`CloudinaryAsset`)

Represents the data returned by Cloudinary upon a successful upload, stored alongside domain records or used as DTO payload.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `publicId` | `string` | Required, Non-empty | Unique asset identifier in Cloudinary (used for deletion/management). |
| `url` | `string` | Required, valid HTTPS URL | Permanent secure CDN delivery URL for the asset. |
| `format` | `string` | Required | File extension / format (e.g. `jpg`, `png`, `webp`). |
| `width` | `number` | Positive integer | Image pixel width. |
| `height` | `number` | Positive integer | Image pixel height. |
| `bytes` | `number` | Positive integer, max 5,242,880 (5MB) | File size in bytes. |
| `resourceType` | `string` | Enum: `image`, `raw`, `video` | Cloudinary asset resource classification. |
| `createdAt` | `string` | ISO 8601 timestamp | Timestamp when the asset was uploaded to Cloudinary. |

---

### 2. Media Upload Response DTO (`UploadResponse`)

Zod schema representation in `src/shared/schemas/upload.ts` (or `media.ts`) for client-server contract:

```typescript
import { z } from "zod";

export const CloudinaryAssetSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  resourceType: z.enum(["image", "raw", "video"]),
  createdAt: z.string(),
});

export type CloudinaryAsset = z.infer<typeof CloudinaryAssetSchema>;

export const SingleUploadResponseSchema = z.object({
  success: z.literal(true),
  data: CloudinaryAssetSchema,
});
```

---

### 3. Database Schema Alignment

The `profiles` and `posts` tables store HTTPS image URLs pointing to Cloudinary.

- **Profile Avatar**: `profiles.avatar_url` (varchar/text) stores Cloudinary `url` or URL with transformation parameters.
- **Post Attachment**: `posts.media_urls` or `post_attachments` table stores array of Cloudinary URLs.
