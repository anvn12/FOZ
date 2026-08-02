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
