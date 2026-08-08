# Phase 0: Research & Technical Decisions - Image Upload Verification and Compression

**Feature Branch**: `014-image-upload-compression`
**Date**: 2026-08-02

## Research Findings & Architectural Decisions

### 1. Client-Side Image Processing & Compression Strategy

- **Decision**: Use HTML5 `Canvas API` and `OffscreenCanvas` (with fallback to standard canvas element) and `canvas.toBlob('image/webp', quality)` for client-side resizing, EXIF orientation correction, and WebP compression.
- **Rationale**:
  - Zero external heavy bundle overhead (uses native browser capabilities supported by 98%+ modern browsers).
  - High performance: canvas operations execute on GPU-accelerated browser contexts.
  - Automatically handles image rescaling to max 1600x1600 (feed posts) and 512x512 (profile avatars) preserving aspect ratio.
  - Generates web-optimized `image/webp` blobs prior to network payload transmission.
- **Alternatives Considered**:
  - `browser-image-compression` library: Adds npm dependency; native Canvas API is sufficient and lower overhead.
  - WASM-based libwebp: Heavy binary download overhead for client devices.

---

### 2. Server-Side Image Processing & Safety Fallback

- **Decision**: Use `sharp` in Express backend service (`src/backend/services/image-processor.ts`) coupled with `multer` memory storage for secondary validation, metadata stripping, WebP conversion, and fallback compression.
- **Rationale**:
  - `sharp` is the fastest Node.js image processing library (powered by libvips).
  - Strips EXIF metadata (GPS location, camera details) while parsing and retaining orientation tags.
  - Guarantees server stability against uncompressed or malicious API bypass uploads.
  - Re-encodes images to web-optimized WebP format and enforces 2MB max output cap.
- **Alternatives Considered**:
  - `jimp`: Pure JavaScript image processing, but significantly slower and higher memory consumption under load.
  - `ImageMagick` CLI spawn: Requires system binary dependency and incurs process spawning overhead.

---

### 3. Upload Middleware & Request Handling

- **Decision**: Implement `multer` memory storage buffer middleware (`src/backend/api/upload/`) capped at 25MB raw file payload limit.
- **Rationale**:
  - Prevents disk I/O bottlenecks by processing files directly in memory buffers.
  - Strictly checks magic bytes (file signatures) to prevent malicious files disguised with `.jpg`/`.png` extensions from reaching memory processing.
- **Alternatives Considered**:
  - Temporary disk file storage: Higher disk I/O latency and risk of uncleaned temp files.

---

### 4. Shared Validation Schemas & Contracts

- **Decision**: Define shared Zod validation schemas in `src/shared/schemas/image.ts` for file type, dimension bounds, size caps, and upload payload metadata.
- **Rationale**:
  - Aligns with FOZ Constitution Principle I & IV (single source of truth in `src/shared/`, input validation at boundary).
