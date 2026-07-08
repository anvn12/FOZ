<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Trigger: Vision Document v1.1 (moderation workflow split into 3 use cases,
  AI fallback chain + auth-gating, accessibility & audit-logging NFRs,
  reporting scope confirmed as content + users, single report table).
- Modified principles:
  - PRINCIPLE_IV → IV. Security at Every Layer: added Guest as a read-only
    tier; added rate limiting and moderation audit logging; aligned moderation
    language to a single report table with status lifecycle
    (pending → dismissed | escalated → closed); reporting scope =
    posts, comments, or users.
  - NEW PRINCIPLE_VI → VI. AI Service Isolation (promoted from Deferred):
    provider swappable + fallback chain, auth-gated, graceful degradation.
- Added sections: none.
- Removed sections: Deferred Principles (AI Service Abstraction promoted to
  Core as Principle VI).
- Quality Standards: added WCAG 2.1 Level AA requirement.
- Development Workflow: moderation migration task now references the single
  report table + status enum (report and violation tables consolidated).
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section unchanged)
  - .specify/templates/spec-template.md — ✅ compatible
  - .specify/templates/tasks-template.md — ✅ compatible (moderation migration task wording updated)
  - .specify/templates/checklist-template.md — ✅ compatible
  - .specify/templates/commands/*.md — ✅ N/A
  - Runtime guidance: README.md — ⚠ review: add Guest role alongside User/Moderator/Admin to match Principle IV.
- Follow-up TODOs: update README.md role list to include Guest.
-->

# FOZ Constitution

## Core Principles

### I. Modular Client-Server Architecture
Strict client/server separation. No business logic in the client; no
presentation in the server. Client and server ship as two independent npm
packages. There MUST be no shared package between them.

Cross-cutting contracts — DTOs, error envelopes, and socket event names — are
**MIRRORED by hand** across `client/src/types` and `server/src/types`. Mirrored
types stay in sync by convention and MUST be updated in the same change. A
shared package is a deliberate non-goal until duplication cost visibly exceeds
sync cost.

### II. Enforced Folder Structure
Every file MUST live in a predictable, documented location. The canonical
layout is defined in `AGENTS.md` (Repo Structure) and in each package's own
directory tree. Folder structure is documented in the plan artifact as a
first-class design decision.

Deviations require written justification plus approval **before**
implementation, not after.

### III. Clean Code & Reusability
Write for the next reader. Reuse before duplicate. Error handling MUST be
centralized per architectural layer via one consistent mechanism per layer.
No inline error swallowing: errors MUST propagate explicitly to a designated
handler.

No dead code, commented-out blocks, or debug artifacts on `main`.

### IV. Security at Every Layer
Authentication and authorization MUST be enforced at every architectural
boundary, not only at the entry point. Input validation MUST happen at
ingestion (the API boundary) and MUST never be skipped for "internal" calls.
Sensitive data MUST NOT be logged and MUST NOT appear in error responses.

Authorization is ownership-based by default: users may only create, edit, and
delete their own content, enforced in both the UI and the API.

Role-based access control (Guest / User / Mod / Admin) is first-class for the
moderation pipeline:

- Guests are read-only and unauthenticated: they may view content but MUST
  NOT post, interact, report, or trigger AI features; any write attempt MUST
  be rejected at the API boundary and prompt authentication.
- Users report posts, comments, or other users to moderators.
- Moderators review pending reports and either dismiss them OR escalate
  critical cases to admins. Moderators MUST NOT issue punishments.
- Admins review escalated reports and issue punishments (warn, suspend, ban,
  remove content). Admins outrank Mods.
- Reports carry a status lifecycle: pending → dismissed | escalated → closed.
- Each role tier MUST be enforced at the API boundary via middleware, not
  only in the UI.

Separation of powers: no single role may both flag and punish.

Rate limiting MUST be applied to costly or abuse-prone endpoints (e.g., AI
summarization).

Moderation actions — escalations, punishments, content removal — MUST be
logged for audit. Logs MUST NOT contain sensitive data.

### V. Consistency Over Cleverness
Patterns MUST be followed everywhere they apply. No novel or clever solutions
where a conventional approach exists. New patterns MUST be documented and
applied consistently going forward. Code that surprises the reader requires
written justification.

### VI. AI Service Isolation
AI features MUST sit behind a dedicated service interface. The provider MUST
be swappable without business-logic changes, and a fallback provider chain
MUST be configured so a single provider outage or quota exhaustion does not
disable the feature. AI features MUST require authentication; guests MUST NOT
trigger AI calls. AI unavailability MUST NOT block core user flows — it MUST
degrade gracefully with a clear message.

## Quality Standards

All code on `main` MUST:

- Pass the package type check with zero errors (`tsc --noEmit` per package).
  Lint/format config, once added, becomes binding from that point forward.
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

- Features start with spec → plan → task generation **before** implementation.
- Each task MUST reference its user story and phase.
- Security hardening and error handling MUST be part of every implementation
  phase, not optional polish.
- Moderation-pipeline tasks MUST include a Prisma migration task (the `role`
  field plus the `report` table with its status enum: pending, dismissed,
  escalated, closed) before any mod or admin UI or route work begins.

## Deferred Principles

None currently active. The AI Service principle was promoted to Core
Principle VI upon the Vision Document v1.1 landing the TL;DR feature.

## Governance

This constitution supersedes all other coding conventions and informal
agreements.

Amendments require: a written proposal with rationale, a semver version bump,
a `LAST_AMENDED_DATE` update, and a propagation check against all
`.specify/templates/*.md` files.

All implementation plans MUST include a **Constitution Check** section
validating the design against these principles before Phase 0 research.
Non-compliance MUST be justified in the plan's Complexity Tracking section.

**Version**: 1.1.0 | **Ratified**: 2026-06-30 | **Last Amended**: 2026-07-08