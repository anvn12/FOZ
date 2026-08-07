# Implementation Plan: Cloudinary Media Storage Integration

**Branch**: `016-cloudinary-media-storage` | **Date**: 2026-08-02 | **Spec**: [spec.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/spec.md)

**Input**: Feature specification from [`specs/016-cloudinary-media-storage/spec.md`](file:///d:/FOZ/specs/016-cloudinary-media-storage/spec.md)

## Summary

Integrate Cloudinary cloud storage into the FOZ application for persistent binary media asset management (user profile avatars, post attachments, thread media). Since Render backend hosting uses ephemeral storage, Cloudinary will serve as the external HTTPS media CDN. Uploads are processed via server-side signed streams using the `cloudinary` SDK behind Express JWT authentication middleware, ensuring zero exposure of private API secrets to client bundles.

## Technical Context

**Language/Version**: TypeScript ESM (Node.js LTS)

**Primary Dependencies**: Express, `cloudinary`, `multer`, Zod

**Storage**: Neon PostgreSQL (relational metadata & URLs), Cloudinary (binary media assets)

**Testing**: Vitest (backend unit & integration tests)

**Target Platform**: Render (Backend Express API), Vercel (Frontend React SPA)

**Project Type**: Fullstack Web Application

**Performance Goals**: Media upload response time <3s for standard image sizes (<5MB); CDN delivery load time <2s.

**Constraints**: Strict zero-exposure of `CLOUDINARY_API_SECRET`; strict JWT authentication required for all upload endpoints; free-tier storage optimization via dynamic format/quality transformations (`f_auto,q_auto`).

**Scale/Scope**: Avatar images (max 2MB), post attachment images (max 5MB, up to 5 images per post).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Modular Architecture**: Zod schemas defined in `src/shared/schemas/upload.ts` as the single source of truth for both frontend and backend.
- [x] **Principle II: Folder Structure & API Conventions**: All API routes follow the `/api/v1` prefix convention mounted via `apiRouter` (`apiRouter.use("/upload", uploadRouter)`).
- [x] **Principle III: Clean Code & Centralized Errors**: Uses central Express error-handling middleware for upload failures.
- [x] **Principle IV: Security at Every Layer**: Enforces JWT authentication middleware on `/upload` endpoints; validates MIME types and file sizes with Zod; private API secret remains server-side.
- [x] **Principle V: Consistency**: Uses standard Express + multer + Cloudinary SDK streaming patterns.
- [x] **Principle VII: Accessibility**: All uploaded media assets render in frontend with required `alt` text attributes.

## Project Structure

### Documentation (this feature)

```text
specs/016-cloudinary-media-storage/
├── plan.md              # Implementation Plan
├── research.md          # Technical research and decisions
├── data-model.md        # Entity definitions & Zod DTO schemas
├── quickstart.md        # Environment setup & curl testing guide
├── contracts/
│   └── upload-api.yaml  # OpenAPI schema for upload API
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Layout

```text
src/
├── shared/
│   └── schemas/
│       └── upload.ts           # CloudinaryAsset & UploadResponse Zod schemas
├── backend/
│   ├── env.ts                  # Zod schema for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
│   ├── services/
│   │   └── cloudinary.ts       # Cloudinary SDK wrapper (upload_stream, destroy)
│   └── api/
│       └── upload/
│           ├── routes.ts       # Express router mounted on apiRouter via apiRouter.use("/upload", uploadRouter)
│           └── __tests__/
│               └── upload.test.ts # Integration tests for Cloudinary upload endpoint
└── frontend/
    └── src/
        └── api/
            └── upload.ts       # Client API function for posting media to /api/v1/upload/cloudinary
```

**Structure Decision**: Standard client-server structure complying with FOZ Constitution Principle II and API routing convention (`/api/v1` mounted on `apiRouter`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Fully complies with FOZ Constitution principles. |
