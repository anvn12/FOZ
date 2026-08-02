import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "../env.js";
import type { CloudinaryAsset } from "../../shared/schemas/upload.js";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

export async function uploadStream(
  fileBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryAsset> {
  ensureConfigured();

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured in environment.");
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      resource_type: "auto",
      folder: options.folder || "foz_uploads",
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload stream failed"));
        }

        const asset: CloudinaryAsset = {
          publicId: result.public_id,
          url: result.secure_url || result.url,
          format: result.format || "jpg",
          width: result.width || 0,
          height: result.height || 0,
          bytes: result.bytes || fileBuffer.length,
          resourceType: (result.resource_type as "image" | "raw" | "video") || "image",
          createdAt: result.created_at || new Date().toISOString(),
        };

        resolve(asset);
      }
    );

    stream.end(fileBuffer);
  });
}

export async function destroyAsset(publicId: string): Promise<{ success: true; result: string }> {
  ensureConfigured();

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured in environment.");
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return { success: true, result: result.result || "ok" };
}
