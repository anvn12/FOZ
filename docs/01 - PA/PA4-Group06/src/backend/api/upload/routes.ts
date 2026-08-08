import { Router, type Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { requireAuth, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { processImage } from "#backend/services/image-processor.js";
import {
  MAX_RAW_FILE_SIZE_BYTES,
  UploadTypeSchema,
} from "#shared/schemas/image.js";

export const uploadRouter = Router();

const upload = multer({
  limits: {
    fileSize: MAX_RAW_FILE_SIZE_BYTES,
  },
  storage: multer.memoryStorage(),
});

const UPLOAD_DIR = join(process.cwd(), "uploads", "images");

uploadRouter.post(
  "/image",
  requireAuth,
  upload.single("image"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: "MISSING_FILE",
            message: "No image file provided in upload request",
          },
        });
      }

      const parsedType = UploadTypeSchema.safeParse(req.body.uploadType);
      const uploadType = parsedType.success ? parsedType.data : "feed_post";

      // Process image using sharp (strips EXIF, resizes, converts to WebP)
      const processed = await processImage(req.file.buffer, uploadType);

      if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      const assetId = randomUUID();
      const fileName = `${assetId}.webp`;
      const filePath = join(UPLOAD_DIR, fileName);

      writeFileSync(filePath, processed.buffer);

      const publicUrl = `/uploads/images/${fileName}`;

      return res.status(201).json({
        success: true,
        data: {
          id: assetId,
          url: publicUrl,
          originalSize: req.file.size,
          compressedSize: processed.size,
          width: processed.width,
          height: processed.height,
          mimeType: processed.mimeType,
        },
      });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message.toLowerCase().includes("unsupported image format") ||
          err.message.toLowerCase().includes("unsupported format"))
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_FILE_TYPE",
            message: err.message,
          },
        });
      }

      if (err instanceof Error && err.message.includes("exceeds maximum allowed")) {
        return res.status(413).json({
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: err.message,
          },
        });
      }
      next(err);
    }
  }
);

uploadRouter.post(
  "/cloudinary",
  requireAuth,
  upload.single("file"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: {
            code: "MISSING_FILE",
            message: "No file provided in upload request",
          },
        });
      }

      // Max size check: 5MB for Cloudinary uploads
      const MAX_CLOUDINARY_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_CLOUDINARY_SIZE) {
        return res.status(413).json({
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "File exceeds maximum size limit of 5MB",
          },
        });
      }

      const folder = (req.body?.folder as string) || "foz_uploads";
      const { uploadStream } = await import("#backend/services/cloudinary.js");
      const asset = await uploadStream(file.buffer, { folder });

      return res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("not configured")) {
        return res.status(503).json({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Cloudinary media storage service is unconfigured",
          },
        });
      }
      next(err);
    }
  }
);

uploadRouter.delete(
  "/cloudinary/{*publicId}",
  requireAuth,
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const rawPublicId = req.params.publicId ?? req.query.publicId;
      const publicId = typeof rawPublicId === "string" ? rawPublicId : Array.isArray(rawPublicId) ? String(rawPublicId[0]) : "";
      if (!publicId) {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUEST",
            message: "Public ID is required for asset deletion",
          },
        });
      }

      const { destroyAsset } = await import("#backend/services/cloudinary.js");
      const result = await destroyAsset(publicId);

      return res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("not configured")) {
        return res.status(503).json({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Cloudinary media storage service is unconfigured",
          },
        });
      }
      next(err);
    }
  }
);

