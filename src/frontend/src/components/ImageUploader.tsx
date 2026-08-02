import React, { useState, useRef } from "react";
import type { UploadType } from "#shared/schemas/image";
import {
  validateImageFile,
  compressImageClient,
  type CompressionResult,
} from "#frontend/utils/imageCompressor";
import { uploadImageApi, type UploadImageResult } from "#frontend/api/upload";

export interface ImageUploaderProps {
  uploadType?: UploadType;
  onUploadComplete?: (result: UploadImageResult) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  disabled?: boolean;
}

export type UploadStage =
  | "idle"
  | "validating"
  | "compressing"
  | "uploading"
  | "completed"
  | "error";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadType = "feed_post",
  onUploadComplete,
  onUploadError,
  label = "Select Image",
  disabled = false,
}) => {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    originalSize: string;
    compressedSize: string;
    reductionPercent: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setErrorMessage(null);
    setUploadStats(null);
    setStage("validating");
    setProgress(10);

    // Step 1: Pre-validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      const err = validation.error || "Invalid file selected";
      setErrorMessage(err);
      setStage("error");
      if (onUploadError) onUploadError(err);
      return;
    }

    let payloadBlob: Blob | File = file;
    let payloadName = file.name;
    let isClientCompressed = false;

    // Step 2: Client-side Canvas Compression
    try {
      setStage("compressing");
      setProgress(40);

      const compression: CompressionResult = await compressImageClient(file, uploadType);
      payloadBlob = compression.blob;
      payloadName = compression.fileName;
      isClientCompressed = true;
    } catch (clientErr) {
      console.warn("Client compression fallback to server-side processing:", clientErr);
      // Gracefully fall back to raw file submission (FR-009)
      payloadBlob = file;
      payloadName = file.name;
      isClientCompressed = false;
    }

    // Step 3: Server Transmission
    try {
      setStage("uploading");
      setProgress(75);

      const result = await uploadImageApi(
        payloadBlob,
        payloadName,
        uploadType,
        isClientCompressed
      );

      setProgress(100);
      setStage("completed");
      setPreviewUrl(result.url);

      const origSize = result.originalSize;
      const compSize = result.compressedSize;
      const reduction = Math.max(
        0,
        Math.round(((origSize - compSize) / origSize) * 100)
      );

      setUploadStats({
        originalSize: formatBytes(origSize),
        compressedSize: formatBytes(compSize),
        reductionPercent: reduction,
      });

      if (onUploadComplete) onUploadComplete(result);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An error occurred during upload";
      setErrorMessage(msg);
      setStage("error");
      if (onUploadError) onUploadError(msg);
    }
  };

  const stageMessages: Record<UploadStage, string> = {
    idle: "",
    validating: "Validating file format...",
    compressing: "Compressing image on device...",
    uploading: "Uploading compressed asset...",
    completed: "Image processed & uploaded successfully!",
    error: "Upload failed",
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          disabled={disabled || stage === "validating" || stage === "compressing" || stage === "uploading"}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
          aria-label={label}
        >
          {label}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileChange}
          className="hidden"
          data-testid="image-input"
        />

        {stage !== "idle" && (
          <span
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
            role="status"
            aria-live="polite"
          >
            {stageMessages[stage]}
          </span>
        )}
      </div>

      {/* Progress Bar (WCAG Accessible) */}
      {(stage === "validating" || stage === "compressing" || stage === "uploading") && (
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Image upload progress"
            className="bg-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error Banner */}
      {stage === "error" && errorMessage && (
        <div
          role="alert"
          className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium"
        >
          {errorMessage}
        </div>
      )}

      {/* Uploaded Preview & Compression Stats */}
      {stage === "completed" && previewUrl && (
        <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900/50">
          <img
            src={previewUrl}
            alt="Uploaded compressed preview"
            className="w-12 h-12 object-cover rounded-md border border-neutral-300 dark:border-neutral-700"
          />
          {uploadStats && (
            <div className="text-xs space-y-0.5 text-neutral-600 dark:text-neutral-400">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {uploadStats.reductionPercent}% file size reduction
              </p>
              <p>
                {uploadStats.originalSize} → {uploadStats.compressedSize} (WebP)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
