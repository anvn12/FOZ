<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (MAJOR)
  Rationale: Principle I backward-incompatibly redefined — a shared package
  was a "deliberate non-goal" and is now mandated as `src/shared/` Zod schemas;
  the ORM mandate changed Prisma → Drizzle; AI promoted from deferred to an
  active core principle. These are governance/principle redefinitions, not
  clarifications, so MAJOR per semver.
- Modified principles (old → new):
  - I. Modular Client-Server Architecture: "no shared package, types mirrored
    by hand across client/src + server/src" → "`src/shared/` Zod schemas are
    the single source of truth, imported via path aliases; no codegen/tRPC"
  - II. Enforced Folder Structure: `client/` + `server/` paths →
    `src/frontend/` + `src/backend/` + `src/shared/`
  - III. Clean Code & Reusability: clarified the per-layer central error
    mechanism (Express error middleware; FE toast/error-boundary path)
  - IV. Security at Every Layer: codified JWT access + refresh cookie, bcrypt,
    `role` column; removed Prisma-specific wording
  - V. Consistency Over Cleverness: added binding-technology-stack clause
- Added sections:
  - VI. AI Service Boundaries (promoted from "Deferred Principles" to an
    active core principle — the TL;DR feature is now in scope per tech stack)
  - Technology Stack (new section codifying the validated choices from
    docs/Techstack/be.md and docs/Techstack/fe.md)
  - Decision-authority clause in Governance (imported from the Team Contract)
- Removed sections:
  - Deferred Principles / AI Service Abstraction — promoted to Principle VI;
    nothing remains deferred
- Templates requiring updates (consistency propagation):
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check
    section is generic and delegates to this file; its "Web application"
    source-tree option is advisory and explicitly meant to be replaced with
    real paths per feature, so the `src/{frontend,backend,shared}` convention
    is honored at plan time)
  - .specify/templates/spec-template.md — ✅ compatible (generic User
    Scenarios / Requirements / Success Criteria; no stack-coupled content)
  - .specify/templates/tasks-template.md — ✅ compatible (generic; path
    conventions are advisory and overridden by plan.md; Phase 2 "database
    schema and migrations framework" accommodates Drizzle/drizzle-kit)
  - .specify/templates/checklist-template.md — ✅ compatible (generic)
  - .specify/templates/commands/ — ✅ N/A (no command files present)
  - AGENTS.md — ✅ compatible (SpeckIt pointer only; no stale references)
  - README.md — ✅ compatible (User/Moderator/Admin roles consistent with
    Principle IV; src/frontend + src/backend layout consistent with Principle II)
- Follow-up TODOs: none. Note: `src/frontend/`, `src/backend/`, and `src/shared/`
  are not yet scaffolded in the repo — this constitution codifies the intended
  layout from docs/Techstack and README.md so scaffolding conforms to it.
-->

# FOZ Constitution

## Core Principles

### I. Modular Client-Server Architecture
Strict client/server separation. No business logic in the client; no
presentation in the server. The client lives in `src/frontend/` and the
server in `src/backend/`; both are TypeScript ESM behind one toolchain.

Cross-cutting contracts — Zod schemas, DTOs, error envelopes, and socket
event names — live in `src/shared/` as the **single source of truth**,
imported by both sides via path aliases. No npm workspace package, no
codegen, no tRPC. Duplicating these types across sides is a defect; the
shared module is the only copy.

Rationale: a 4-person team on a deadline. One language and one shared
schema module beat two toolchains and hand-mirrored types.

### II. Enforced Folder Structure
Every file MUST live in a predictable, documented location. The canonical
layout is `src/frontend/` (Vite + React), `src/backend/` (Express + Drizzle),
and `src/shared/` (Zod schemas), as defined in `AGENTS.md` and in each
feature's `plan.md` Project Structure section. Folder structure is a
first-class design decision recorded in the plan.

Deviations require written justification plus approval **before**
implementation, not after.

### III. Clean Code & Reusability
Write for the next reader. Reuse before duplicate. Error handling MUST be
centralized per architectural layer via one consistent mechanism per layer:
the backend uses a central error-handling middleware on Express; the
frontend uses a single error-boundary / toast path. No inline error
swallowing: errors MUST propagate explicitly to the designated handler.

No dead code, commented-out blocks, or debug artifacts on `main`.

### IV. Security at Every Layer
Authentication and authorization MUST be enforced at every architectural
boundary, not only at the entry point. Input validation MUST happen at
ingestion (the API boundary) via Zod and MUST never be skipped for
"internal" calls. Sensitive data MUST NOT be logged and MUST NOT appear in
error responses.

Authentication is JWT access (short-lived, client memory) + refresh
(http-only `SameSite=Lax` cookie), passwords hashed with bcrypt.
Authorization is ownership-based by default: users may only create, edit,
and delete their own content, enforced in both the UI and the API.

Role-based access control (Guest / Standard User / Moderator /
Administrator) is first-class for the moderation pipeline and MUST be
enforced at the API boundary via middleware, not only in the UI:

- Users report threads or other users to moderators.
- Moderators review reports and flag them as violations OR dismiss them.
  Moderators MUST NOT issue punishments.
- Administrators review flagged violations and issue punishments (warn,
  suspend, ban). Administrators outrank Moderators.
- Separation of powers: no single role may both flag and punish.

Rate limiting MUST be applied to costly or abuse-prone endpoints (e.g., AI
summarization).

Moderation actions — escalations, punishments, content removal — MUST be
logged for audit. Logs MUST NOT contain sensitive data.

### V. Consistency Over Cleverness
Patterns MUST be followed everywhere they apply. No novel or clever
solutions where a conventional approach exists. New patterns MUST be
documented and applied consistently going forward. Code that surprises the
reader requires written justification.

The validated technology stack (see Technology Stack) is binding;
introducing a replacement library or framework requires a constitution
amendment, not a silent swap.

### VI. AI Service Boundaries
AI features (TL;DR summarization) MUST sit behind a single, small service
module with a swappable provider: a pure-function prompt plus a `for` loop
over fetch-based providers (OpenAI/Gemini), no streaming or caching in v1.
The provider MUST be swappable without business-logic changes. AI
unavailability MUST NOT block core user flows; a failed summarization MUST
degrade gracefully (e.g., hide the TL;DR control), never break the post
view.

## Technology Stack
The validated stack is the binding baseline. Source of truth:
`docs/Techstack/be.md` and `docs/Techstack/fe.md`; version floors are
defined there. The backend follows current Node LTS.

Backend:

- Runtime: Node.js LTS, ESM, pinned via `.nvmrc`.
- Web framework: Express with hand-wired Zod validation middleware and a
  central error handler.
- Database: PostgreSQL 16, provisioned via `docker-compose.yml`.
- Data layer: Drizzle (SQL-visible), migrations via `drizzle-kit`.
- Realtime: socket.io server on Express's `httpServer`; a small fixed
  event set, inline emits.
- Auth: JWT access + refresh cookie, bcrypt, `role` column + hardcoded
  permission matrix.
- Config: Zod-validated environment, fail-fast at startup.
- Tests: Vitest — tier-1 pure unit tests, tier-2 integration; no E2E.

Frontend:

- Build: Vite. Framework: React + TypeScript. Styling: Tailwind CSS,
  vanilla config, NO UI component library.
- Routing: react-router-dom. Server state: @tanstack/react-query. Client
  state: zustand. Realtime: socket.io-client. Forms: react-hook-form.
  Toasts: react-hot-toast.
- Lint/format: ESLint + Prettier. Module system: ESM,
  `moduleResolution: "bundler"`, `noEmit`.
- Tests: Vitest.

Shared:

- `src/shared/` Zod schemas are the source of truth, imported via path
  aliases. No workspace package, no codegen, no tRPC.

### VI. AI Service Isolation
AI features MUST sit behind a dedicated service interface. The provider MUST
be swappable without business-logic changes, and a fallback provider chain
MUST be configured so a single provider outage or quota exhaustion does not
disable the feature. AI features MUST require authentication; guests MUST NOT
trigger AI calls. AI unavailability MUST NOT block core user flows — it MUST
degrade gracefully with a clear message.

## Quality Standards

All code on `main` MUST:

- Pass the package type check with zero errors (`tsc --noEmit` per
  package). ESLint + Prettier config is binding from the point it is added.
- Pass `vitest` for any covered tier-1/tier-2 tests; integration tests for
  auth and feed MUST stay under the 500ms NFR.
- Validate inbound requests with Zod at trust boundaries; no unvalidated
  payload reaches a service.
- Handle errors through the centralized error mechanism; no silent catch.
- Contain no dead code, commented-out blocks, or debug artifacts.
- Respect the folder structure defined in the feature plan.
- Pass ownership checks — and role checks once RBAC lands — for protected
  resources.
- Document performance and scalability expectations in each `plan.md` under
  Technical Context, since these are feature-specific.
- Frontend MUST meet WCAG 2.1 Level AA (keyboard navigation, color contrast,
  screen-reader labels).

## Development Workflow

- Features start with spec → plan → task generation **before**
  implementation.
- Each task MUST reference its user story and phase.
- Security hardening and error handling MUST be part of every
  implementation phase, not optional polish.
- Moderation-pipeline tasks MUST include a Drizzle migration task
  (`drizzle-kit`) for the `role` column plus report and violation tables
  before any moderator or admin UI or route work begins.
- No direct pushes to `main`; work on feature branches and merge via PR
  with at least one reviewer.

## Governance

This constitution supersedes all other coding conventions and informal
agreements.

Amendments require: a written proposal with rationale, a semver version
bump, a `LAST_AMENDED_DATE` update, and a propagation check against all
`.specify/templates/*.md` files. Amendments to the Technology Stack
section require the same change reflected in `docs/Techstack/*.md` in the
same PR.

All implementation plans MUST include a **Constitution Check** section
validating the design against these principles before Phase 0 research.
Non-compliance MUST be justified in the plan's Complexity Tracking
section.

Decision authority: day-to-day decisions by consensus; unresolved issues
by majority vote (3 of 5 members); the Project Manager holds the final say
on project-management issues and domain leads on their domain, per the
Team Contract.

**Version**: 2.0.0 | **Ratified**: 2026-06-30 | **Last Amended**: 2026-07-10
