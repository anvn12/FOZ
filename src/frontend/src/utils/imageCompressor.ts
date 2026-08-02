import {
  ALLOWED_IMAGE_MIME_TYPES,
  DIMENSION_LIMITS,
  MAX_RAW_FILE_SIZE_BYTES,
  type UploadType,
} from "#shared/schemas/image";

export interface CompressionResult {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const fileType = file.type.toLowerCase();
  const isAllowedType = ALLOWED_IMAGE_MIME_TYPES.some((type) => type === fileType);

  if (!isAllowedType) {
    return {
      valid: false,
      error: "Unsupported image format. Allowed formats: JPEG, PNG, WebP, HEIC.",
    };
  }

  if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image file exceeds maximum raw size limit of 25MB.",
    };
  }

  return { valid: true };
}

export async function compressImageClient(
  file: File,
  uploadType: UploadType = "feed_post"
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const limits = DIMENSION_LIMITS[uploadType];
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > limits.maxWidth || height > limits.maxHeight) {
        const widthRatio = limits.maxWidth / width;
        const heightRatio = limits.maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to initialize canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas compression failed to generate Blob"));
            return;
          }

          const webpName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

          resolve({
            blob,
            fileName: webpName,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        "image/webp",
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image file"));
    };

    img.src = objectUrl;
  });
}

export async function compressImageToBase64(
  file: File,
  uploadType: UploadType = "feed_post"
): Promise<{ base64: string; size: number; width: number; height: number }> {
  const result = await compressImageClient(file, uploadType);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result as string,
        size: result.compressedSize,
        width: result.width,
        height: result.height,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(result.blob);
  });
}
