# QA Test Report: Profile Management Integration Tests
*Performed by: Nguyễn Hải Trọng*
## 1. Executive Summary
This document provides the QA Test Report for the **Profile Management** feature in FOZ. The integration test suite verifies the end-to-end functionality of profile fetching, updates, validation rules, and avatar image handling via HTTP endpoints.

- **Feature Area**: Profile Management
- **Test Framework**: Vitest & Supertest
- **Test File Location**: `src/backend/__tests__/integration/profile.test.ts`
- **Execution Date**: 2026-07-21
- **Prerequisites**: PostgreSQL database running on port 5432 (`npm run dev:db`)
- **Status**: PASSED / READY

---

## 2. Scope & Components Under Test
- **API Router**: `src/backend/api/profile/routes.ts`
- **Service Layer**: `src/backend/api/profile/profile.service.ts`
- **Database Repository**: `src/backend/db/repositories/profiles.ts`
- **Validation Schemas**: `src/shared/schemas/profile.ts`

---

## 3. Detailed Test Cases

### 3.1. GET /api/v1/profiles/:userId
| Test Case ID | Description | Expected Status | Status |
|---|---|---|---|
| `PROF-GET-01` | Request non-existent user profile UUID | `404 Not Found` (`code: NOT_FOUND`) | **PASS** |
| `PROF-GET-02` | Request existing user profile | `200 OK` with profile object containing user fields | **PASS** |

### 3.2. PATCH /api/v1/profiles/me
| Test Case ID | Description | Expected Status | Status |
|---|---|---|---|
| `PROF-PATCH-01` | Unauthenticated request to update profile | `401 Unauthorized` | **PASS** |
| `PROF-PATCH-02` | Authenticated update with valid fields (`displayName`, `bio`, `location`, `website`) | `200 OK` returning updated profile | **PASS** |
| `PROF-PATCH-03` | Authorization isolation test (User A updating profile does not affect User B) | `200 OK` for User A, User B unchanged | **PASS** |
| `PROF-PATCH-04` | Validation check for empty `displayName` | `422 Unprocessable Entity` (`code: VALIDATION`) | **PASS** |
| `PROF-PATCH-05` | Validation check for `bio` exceeding max length (>160 chars) | `422 Unprocessable Entity` | **PASS** |
| `PROF-PATCH-06` | Website URL transformation (auto-prepends `https://` if missing) and syntax validation | `200 OK` for domain only, `422` for invalid format | **PASS** |

### 3.3. POST /api/v1/profiles/me/avatar
| Test Case ID | Description | Expected Status | Status |
|---|---|---|---|
| `PROF-AVATAR-01` | Unauthenticated avatar upload attempt | `401 Unauthorized` | **PASS** |
| `PROF-AVATAR-02` | Upload valid base64 encoded PNG/JPEG/GIF image (<=2MB) | `200 OK` returning `avatarUrl` | **PASS** |
| `PROF-AVATAR-03` | Upload unsupported mime type (e.g., `image/webp`) | `422 Unprocessable Entity` | **PASS** |
| `PROF-AVATAR-04` | Upload malformed base64 string | `422 Unprocessable Entity` | **PASS** |

---

## 4. Conclusion
All 12 integration test scenarios for Profile Management have been verified and type-checked without any compilation errors. Ensure the PostgreSQL database container is active (`npm run dev:db`) when running tests locally or in CI pipelines.
