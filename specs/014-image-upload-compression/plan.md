# Implementation Plan: Image Upload Verification and Compression

**Branch**: `014-image-upload-compression` | **Date**: 2026-08-02 | **Spec**: [spec.md](file:///d:/FOZ/specs/014-image-upload-compression/spec.md)

**Input**: Feature specification from `/specs/014-image-upload-compression/spec.md`

## Summary

Implement a two-tier image verification and compression architecture to protect server CPU, memory, and bandwidth from overload:
1. **Client-Side Pre-Check & Compression**: HTML5 Canvas API rescales images (feed post max 1600x1600, avatar max 512x512), converts to WebP, and strips client-side overhead prior to upload.
2. **Server-Side Safety Fallback**: Express backend route (`/api/v1/upload/image`) using `multer` and `sharp` to validate magic bytes, strip sensitive EXIF metadata (GPS, camera details), enforce 2MB output caps, and handle API bypass/fallback requests seamlessly.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js LTS, ESM)

**Primary Dependencies**:
- Frontend: HTML5 Canvas API, React, `react-hook-form`
- Backend: Express, `multer`, `sharp`, `zod`
- Shared: `src/shared/schemas/image.ts`

**Storage**: Local file uploads directory (`uploads/images/`) or S3-compatible object storage

**Testing**: Vitest (Unit & Integration tests)

**Target Platform**: Web Browsers (Desktop & Mobile), Express Web API Server

**Project Type**: Full-Stack Web Application (`src/frontend`, `src/backend`, `src/shared`)

**Performance Goals**:
- Client-side compression < 1.5s for 12MB photos
- Server processing < 500ms per image stream
- Average image payload reduction > 60%

**Constraints**:
- Max raw upload selection cap: 25MB
- Max processed output size: 2MB
- Max bounding box: 1600x1600 (feed posts), 512x512 (avatars)
- Output format: WebP (standardized)

**Scale/Scope**: All user image uploads (posts, avatars) across the platform

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Modular Client-Server Architecture (Principle I)**: Frontend in `src/frontend/`, Backend in `src/backend/`, Shared Zod schemas in `src/shared/schemas/image.ts`.
- [x] **Enforced Folder Structure (Principle II)**: All code lives in predictable, standard directories.
- [x] **Clean Code & Reusability (Principle III)**: Errors handled via Express central error handler; frontend Toast notification path.
- [x] **Security at Every Layer (Principle IV)**: Magic byte header inspection; EXIF metadata stripping; file size & MIME type validation at API boundary via Zod middleware.
- [x] **Consistency Over Cleverness (Principle V)**: Follows existing Express/Vitest patterns and shared Zod conventions.
- [x] **Accessibility (Principle VII)**: Alt-text support for all processed image uploads; WCAG keyboard and screen reader accessible progress UI.

## Project Structure

### Documentation (this feature)

```text
specs/014-image-upload-compression/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 technical research findings
├── data-model.md        # Phase 1 data entities and shared schemas
├── quickstart.md        # Feature setup & test runner guide
├── contracts/           # Phase 1 API contracts
│   └── upload-api.yaml  # OpenAPI specification for upload routes
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── schemas/
│       └── image.ts                   # Shared Zod validation schemas
├── backend/
│   ├── api/
│   │   └── upload/
│   │       ├── routes.ts              # Express upload router (/api/v1/upload)
│   │       └── __tests__/
│   │           └── upload.test.ts     # Upload integration & security tests
│   └── services/
│       └── image-processor.ts         # Sharp-based image processing service
└── frontend/
    └── src/
        ├── utils/
        │   ├── imageCompressor.ts     # Client canvas compressor utility
        │   └── __tests__/
        │       └── imageCompressor.test.ts
        └── components/
            └── ImageUploader.tsx      # Reusable image selector with progress bar
```

**Structure Decision**: Web application layout following FOZ Constitution. Client compressor in `src/frontend/src/utils/`, backend processing in `src/backend/services/image-processor.ts`, API endpoint at `/api/v1/upload`, and shared validation in `src/shared/schemas/image.ts`.

## Complexity Tracking

> **No Constitution violations detected.**
