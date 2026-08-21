import { useAuthStore } from "#frontend/stores/auth";
import { ApiError } from "#frontend/api/auth";
import { fetchWithNetworkGuard } from "#frontend/api/network";
import type { UploadType } from "#shared/schemas/image";

export interface UploadImageResult {
  id: string;
  url: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  mimeType: string;
}

export async function uploadImageApi(
  file: Blob | File,
  fileName: string,
  uploadType: UploadType = "feed_post",
  clientCompressed = true,
): Promise<UploadImageResult> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();

  formData.append("image", file, fileName);
  formData.append("uploadType", uploadType);
  formData.append("clientCompressed", String(clientCompressed));

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetchWithNetworkGuard("/api/v1/upload/image", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = "Image upload failed";
    let code = "UPLOAD_FAILED";
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
      if (data?.error?.code) code = data.error.code;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(res.status, code, message);
  }

  const data = await res.json();
  return data.data;
}

export async function uploadMediaToCloudinary(
  file: Blob | File,
  fileName: string,
  folder = "foz_uploads",
): Promise<{
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("folder", folder);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetchWithNetworkGuard("/api/v1/upload/cloudinary", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = "Cloudinary upload failed";
    let code = "UPLOAD_FAILED";
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
      if (data?.error?.code) code = data.error.code;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, code, message);
  }

  const data = await res.json();
  return data.data;
}

export async function deleteCloudinaryMedia(publicId: string): Promise<boolean> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetchWithNetworkGuard(
    `/api/v1/upload/cloudinary/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      headers,
    },
  );

  return res.ok;
}
