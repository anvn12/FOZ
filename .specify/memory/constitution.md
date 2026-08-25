<!--
Sync Impact Report
- Version change: 2.1.0 → 2.2.0 (MINOR)
  Rationale: Reconciles four places where the shipped codebase had already,
  legitimately diverged from the binding Technology Stack / principle text
  (a real cross-review of `main` against this document found the drift, not
  a proposed redesign). Ratifies a component library adopted since v2.1.0,
  removes a push-based realtime/socket.io layer the product was never built
  to need (no chat, no live notification stream — @tanstack/react-query
  refetch already covers every live-update need it actually has), widens
  the AI fallback-chain principle to match a shipped model-level
  implementation, and formally recognizes social login (which shipped
  without ever being added to this document) — while hardening its
  security bar in the same edit, closing a mock-auth bypass a security pass
  found live on `main`. These are corrections, one removal, and one
  addition, not reversals of any existing normative requirement, so MINOR
  per semver (matching the v2.0.0→2.1.0 precedent).
- Modified principles (old → new):
  - IV. Security at Every Layer: added a social-login sub-clause — OAuth is
    now a recognized first-class auth method alongside password + JWT, and
    any mock/test identity-override path MUST be inert outside non-production
    `NODE_ENV`, codifying the fix for a live mock-code account-takeover bug.
  - VI. AI Service Boundaries: fallback chain requirement widened from
    "provider chain (OpenAI/Gemini)" to "provider and/or model chain," since
    the shipped implementation is a same-provider, multi-model chain (Gemini
    tiers) plus a local non-AI degrade path, not a two-vendor chain.
- Modified sections:
  - Technology Stack (Frontend): "NO UI component library" replaced with
    "Tailwind CSS + shadcn/ui (Radix UI primitives)," ratifying a dependency
    already used across ~10 components on `main`.
  - Technology Stack (Backend): added a Social Login row documenting the
    OAuth 2.0 authorization-code flow (Google today) already shipped under
    `specs/019-social-login`.
  - Principle I: dropped "socket event names" from the list of cross-cutting
    shared contracts (no socket layer exists or is planned).
- Added sections: none (all changes land inside existing Core Principles /
  Technology Stack sections).
- Removed sections:
  - Technology Stack (Backend) Realtime line (socket.io server) — the
    product has no push-based realtime feature (no chat, no live
    notification stream); react-query refetch already covers its actual
    live-update needs. Not deferred — removed outright; reintroducing
    realtime later is a fresh design decision, not a resumption of this one.
  - Technology Stack (Frontend) Realtime line (socket.io-client) — same
    reason, dropped in the same edit.
- Templates requiring updates (consistency propagation):
  - .specify/templates/plan-template.md — ✅ compatible (generic Constitution
    Check section; no stack-coupled content)
  - .specify/templates/spec-template.md — ✅ compatible (generic requirements)
  - .specify/templates/tasks-template.md — ✅ compatible (generic)
  - .specify/templates/checklist-template.md — ✅ compatible (generic)
  - docs/Techstack/fe.md — ⚠️ updated in this same change (Styling row,
    Realtime row removed)
  - docs/Techstack/be.md — ⚠️ updated in this same change (Realtime row
    removed, Social Login row added, team size corrected 4→5)
  - AGENTS.md — ✅ compatible (API routing convention unchanged)
  - README.md — not re-verified in this pass; check on next edit that
    touches it
- Follow-up TODOs:
  - No second AI provider exists yet; the widened principle accepts today's
    single-provider/multi-model chain, but a true second provider is still
    the stronger design if/when there's time to build it.
-->

# FOZ Constitution

## Core Principles

### I. Modular Client-Server Architecture
Strict client/server separation. No business logic in the client; no
presentation in the server. The client lives in `src/frontend/` and the
server in `src/backend/`; both are TypeScript ESM behind one toolchain.

Cross-cutting contracts — Zod schemas, DTOs, and error envelopes — live in
`src/shared/` as the **single source of truth**, imported by both sides
via path aliases. No npm workspace package, no codegen, no tRPC.
Duplicating these types across sides is a defect; the shared module is the
only copy.

Rationale: a 5-person team on a deadline. One language and one shared
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

Social login (OAuth 2.0 authorization-code flow; Google today, extensible
to other providers) is a recognized first-class authentication method
alongside password auth, issuing the same JWT access + refresh session on
success. Any mock or test identity-override path (a synthetic
authorization code, a caller-supplied email/profile override) MUST be
inert whenever `NODE_ENV=production` — such a path MUST NEVER be able to
authenticate as, or link to, a real account in production.

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
summarization, authentication).

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
over fetch-based provider and/or model candidates, no streaming or caching
in v1. A fallback chain MUST be configured — across providers, across
models within one provider, or both — so that a single outage or quota
exhaustion partway down the chain does not disable the feature outright.
When the entire chain is exhausted, the feature MUST still degrade
gracefully rather than error out (e.g., a local non-AI fallback).

The provider MUST be swappable without business-logic changes. AI
unavailability MUST NOT block core user flows; a failed summarization MUST
degrade gracefully (e.g., hide the TL;DR control), never break the post
view.

AI features MUST require authentication; guests MUST NOT trigger AI calls.

### VII. Accessibility
The UI MUST meet WCAG 2.1 Level AA. This includes:

- Proper semantic HTML structure throughout all pages.
- Alt-text for all media attachments (images, avatars).
- Sufficient color contrast ratios for text and interactive elements.
- Full keyboard navigability for all interactive elements.
- Screen-reader support via proper ARIA attributes and semantic structure.
- Core actions (create a post, comment, search, generate TL;DR) MUST be
  completable by a new user without external training or documentation.

Accessibility is not polish; it is a launch-blocking requirement for every
UI feature.

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
- Auth: JWT access + refresh cookie, bcrypt, `role` column + hardcoded
  permission matrix.
- Social login: OAuth 2.0 authorization-code flow (Google today), backed
  by a `user_social_links` table; issues the same JWT access + refresh
  session as password auth. Mock/test identity-override paths are gated to
  non-production `NODE_ENV` (see Principle IV).
- Config: Zod-validated environment, fail-fast at startup.
- Tests: Vitest — tier-1 pure unit tests, tier-2 integration; no E2E.

Frontend:

- Build: Vite. Framework: React + TypeScript. Styling: Tailwind CSS,
  vanilla config, plus shadcn/ui (Radix UI primitives) for accessible
  interactive components (dropdown, dialog, tooltip, sidebar, etc.); no
  other UI component library.
- Routing: react-router-dom. Server state: @tanstack/react-query, which
  also covers live updates via refetch/polling — the product does not do
  push-based realtime (no chat, no live notification stream), so there is
  no socket layer. Client state: zustand. Forms: react-hook-form. Toasts:
  react-hot-toast.
- Lint/format: ESLint + Prettier. Module system: ESM,
  `moduleResolution: "bundler"`, `noEmit`.
- Tests: Vitest.

Shared:

- `src/shared/` Zod schemas are the source of truth, imported via path
  aliases. No workspace package, no codegen, no tRPC.

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
- Meet WCAG 2.1 Level AA (keyboard navigation, color contrast,
  screen-reader labels) — see Principle VII.

## Development Workflow

- The project follows Scrum with sprints aligned to PA deliverables (PA1
  through PA5). Sprint planning, daily scrums, sprint review, and
  retrospective are tracked per the team contract.
- Features start with spec → plan → task generation **before**
  implementation.
- Each task MUST reference its user story and phase.
- Security hardening, accessibility, and error handling MUST be part of
  every implementation phase, not optional polish.
- Moderation-pipeline tasks MUST include a Drizzle migration task
  (`drizzle-kit`) for the `role` column plus report and violation tables
  before any moderator or admin UI or route work begins.
- No direct pushes to `main`; work on feature branches and merge via PR
  with at least one reviewer.
- Scope creep is managed via the Jira backlog; new feature ideas require
  team approval before entering an active sprint.

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

**Version**: 2.2.0 | **Ratified**: 2026-06-30 | **Last Amended**: 2026-08-25
