# Quickstart: Image Upload Verification and Compression

**Feature Branch**: `014-image-upload-compression`

## Overview
This feature introduces client-side image pre-validation/compression and server-side safety fallback processing for post images and user avatars.

## Shared Schemas
- Location: `src/shared/schemas/image.ts`
- Exports: `ImageUploadSchema`, `ImageProcessingConfig`

## Backend Implementation
- Location: `src/backend/services/image-processor.ts` (using `sharp`)
- API Route: `src/backend/api/upload/routes.ts` (mounted at `/api/v1/upload`)

## Frontend Implementation
- Canvas Compressor Utility: `src/frontend/src/utils/imageCompressor.ts`
- Component Integration: `src/frontend/src/components/ImageUploader.tsx`

## Testing
- Backend unit & integration tests: `npx vitest run src/backend/api/upload/__tests__/upload.test.ts`
- Frontend image compressor unit tests: `npx vitest run src/frontend/src/utils/__tests__/imageCompressor.test.ts`
