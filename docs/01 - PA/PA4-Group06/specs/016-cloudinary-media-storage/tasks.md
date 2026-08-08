# Tasks: Cloudinary Media Storage Integration

**Input**: Design documents from `/specs/016-cloudinary-media-storage/`

**Prerequisites**: [plan.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/plan.md), [spec.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/spec.md), [research.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/research.md), [data-model.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/data-model.md), [contracts/upload-api.yaml](file:///d:/FOZ/specs/016-cloudinary-media-storage/contracts/upload-api.yaml), [quickstart.md](file:///d:/FOZ/specs/016-cloudinary-media-storage/quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Explicit file paths included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and environment configuration

- [x] T001 [P] Add `cloudinary` dependency in package.json and verify Node.js ESM compatibility
- [x] T002 [P] Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to .env.example, .env, and Zod schema in src/backend/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core DTO schemas, service wrappers, and API routing structure required before story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create Zod schemas CloudinaryAssetSchema and SingleUploadResponseSchema in src/shared/schemas/upload.ts
- [x] T004 [P] Re-export upload Zod schemas in src/shared/schemas/index.ts
- [x] T005 Implement Cloudinary SDK wrapper service (uploadStream and destroyAsset methods) in src/backend/services/cloudinary.ts
- [x] T006 Setup Express upload router in src/backend/api/upload/routes.ts with Multer memory storage and mount under apiRouter with `/upload` prefix in src/backend/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Secure Media Upload and Storage (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can upload image assets to Cloudinary through the backend Express API and obtain secure HTTPS URLs.

**Independent Test**: Post a multipart image file to `POST /api/v1/upload/cloudinary` with JWT token and verify successful upload and returned HTTPS URL.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create unit tests for Cloudinary upload service in src/backend/services/__tests__/cloudinary.test.ts
- [x] T008 [US1] Implement signed upload endpoint POST /api/v1/upload/cloudinary in src/backend/api/upload/routes.ts using JWT auth middleware, multer memory storage, and Zod payload validation
- [x] T009 [US1] Implement integration tests for POST /api/v1/upload/cloudinary in src/backend/api/upload/__tests__/upload.test.ts
- [x] T010 [P] [US1] Create frontend client API function uploadMediaToCloudinary in src/frontend/src/api/upload.ts

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready)

---

## Phase 4: User Story 2 - Media Retrieval and Optimized Delivery (Priority: P2)

**Goal**: Uploaded images are rendered in profile and post components using Cloudinary optimized URLs (`f_auto,q_auto`).

**Independent Test**: Select and submit an image in profile edit or post creation UI, and verify the rendered image loads directly from Cloudinary CDN.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create helper function getOptimizedCloudinaryUrl in src/frontend/src/utils/cloudinary.ts for applying transformation parameters (f_auto, q_auto)
- [x] T012 [US2] Integrate uploadMediaToCloudinary into profile avatar upload flow in src/frontend/src/components/ProfileEditModal.tsx
- [x] T013 [US2] Integrate uploadMediaToCloudinary into post image attachment flow in src/frontend/src/components/CreatePostModal.tsx

**Checkpoint**: User Stories 1 and 2 are fully integrated and functional

---

## Phase 5: User Story 3 - Media Deletion and Cleanup (Priority: P3)

**Goal**: Content owners or administrators can delete uploaded media assets from Cloudinary using `public_id`.

**Independent Test**: Send a `DELETE /api/v1/upload/cloudinary/*` request with JWT auth and verify asset deletion in Cloudinary.

### Implementation for User Story 3

- [x] T014 [US3] Implement asset deletion endpoint DELETE /api/v1/upload/cloudinary/* in src/backend/api/upload/routes.ts calling destroyAsset service method
- [x] T015 [US3] Add integration tests for deletion endpoint in src/backend/api/upload/__tests__/upload.test.ts

**Checkpoint**: All user stories functional and complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and quality verification

- [x] T016 [P] Update environment configuration setup and Cloudinary instructions in README.md
- [x] T017 Execute manual validation following testing scenarios in specs/016-cloudinary-media-storage/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (MVP!)
- **User Story 2 (Phase 4)**: Depends on US1 completion (uses uploadMediaToCloudinary API)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion
- **Polish (Phase 6)**: Depends on completion of user stories

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test backend upload endpoint independently using curl / Vitest integration tests

### Incremental Delivery
1. Setup + Foundational → Foundation ready
2. Add US1 → Backend Signed Upload ready (MVP)
3. Add US2 → Frontend Profile and Post UI Cloudinary integration
4. Add US3 → Cloudinary Asset Lifecycle Cleanup
