# Phase 1: Data Model - Image Upload Verification and Compression

**Feature Branch**: `014-image-upload-compression`
**Date**: 2026-08-02

## Data Entities & Shared Schemas

### 1. ImageAsset Entity (Backend & DB Schema)

Represents an uploaded, verified, and compressed visual asset.

```typescript
export interface ImageAsset {
  id: string;                      // Unique UUID asset identifier
  userId: string;                  // Uploader user ID
  originalName: string;            // Original filename provided by client
  originalSize: number;            // Original file size in bytes
  compressedSize: number;          // Final compressed file size in bytes
  mimeType: 'image/webp';          // Target standardized MIME type
  width: number;                   // Bounded image width (px)
  height: number;                  // Bounded image height (px)
  uploadType: 'feed_post' | 'avatar'; // Context of image usage
  storagePath: string;             // File path or storage key/URL
  exifStripped: boolean;           // Confirmation that sensitive EXIF data was removed
  createdAt: string;               // ISO Timestamp
}
```

### 2. Shared Validation Rules (`src/shared/schemas/image.ts`)

- **Allowed Ingestion MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
- **Raw File Size Cap**: `25,165,824 bytes` (25 MB)
- **Compressed File Size Cap**: `2,097,152 bytes` (2 MB)
- **Feed Post Bounding Dimensions**: Max `1600 x 1600` pixels
- **Avatar Bounding Dimensions**: Max `512 x 512` pixels

### 3. UploadSession Transient State (Client Component State)

```typescript
export interface UploadSessionState {
  file: File;
  previewUrl: string;
  stage: 'idle' | 'validating' | 'compressing' | 'uploading' | 'completed' | 'error';
  progressPercentage: number;
  originalSizeFormatted: string;
  compressedSizeFormatted?: string;
  error?: string;
  processedBlob?: Blob;
}
```
