import sharp from "sharp";
import {
  DIMENSION_LIMITS,
  MAX_PROCESSED_FILE_SIZE_BYTES,
  type UploadType,
} from "#shared/schemas/image.js";


export interface ProcessedImageResult {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
  size: number;
  exifStripped: boolean;
}

const ALLOWED_FORMATS = new Set(["jpeg", "jpg", "png", "webp", "heif", "heic"]);

export async function processImage(
  buffer: Buffer,
  uploadType: UploadType
): Promise<ProcessedImageResult> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format.toLowerCase())) {
    throw new Error(`Unsupported image format: ${metadata.format || "unknown"}`);
  }

  const { maxWidth, maxHeight } = DIMENSION_LIMITS[uploadType];

  let quality = 80;
  let processedBuffer = await image
    .rotate() // Auto-orient based on EXIF orientation before stripping
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  // If output exceeds 2MB limit, lower quality step-down to fit under cap
  if (processedBuffer.length > MAX_PROCESSED_FILE_SIZE_BYTES) {
    quality = 60;
    processedBuffer = await sharp(buffer)
      .rotate()
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer();
  }

  if (processedBuffer.length > MAX_PROCESSED_FILE_SIZE_BYTES) {
    throw new Error("Compressed image exceeds maximum allowed 2MB size cap");
  }

  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
    mimeType: "image/webp",
    size: processedBuffer.length,
    exifStripped: true,
  };
}
