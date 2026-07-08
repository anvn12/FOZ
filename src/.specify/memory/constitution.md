<!--
Sync Impact Report
- Version change: 0.0.0 (unratified template) → 1.0.0
- Project name: FOZ
- Modified principles: N/A (initial ratification; all principles newly adopted)
  - PRINCIPLE_1 → I. Modular Client-Server Architecture
  - PRINCIPLE_2 → II. Enforced Folder Structure
  - PRINCIPLE_3 → III. Clean Code & Reusability
  - PRINCIPLE_4 → IV. Security at Every Layer
  - PRINCIPLE_5 → V. Consistency Over Cleverness
- Added sections:
  - Quality Standards (Section 2)
  - Development Workflow (Section 3)
  - Deferred Principles (AI Service Abstraction)
  - Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section present; gates delegate to this file)
  - .specify/templates/spec-template.md — ✅ compatible (mandatory User Scenarios / Requirements / Success Criteria align with Quality Standards)
  - .specify/templates/tasks-template.md — ✅ compatible (Setup + Foundational phases hold the required Prisma migration task for moderation pipeline)
  - .specify/templates/checklist-template.md — ✅ compatible (generic, no constitution-coupled content)
  - .specify/templates/commands/*.md — ✅ N/A (no command files present in templates/commands/)
  - Runtime guidance: README.md — ✅ compatible (describes User/Moderator/Admin roles consistent with Principle IV)
- Follow-up TODOs: none
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

Role-based access control (User / Mod / Admin) is first-class for the
moderation pipeline:

- Users report threads or other users to moderators.
- Moderators review reports and flag them as violations OR dismiss them.
  Moderators MUST NOT issue punishments.
- Admins review flagged violations and issue punishments (warn, suspend, ban).
  Admins outrank Mods.
- Each role tier MUST be enforced at the API boundary via middleware, not
  only in the UI.

Separation of powers: no single role may both flag and punish.

### V. Consistency Over Cleverness
Patterns MUST be followed everywhere they apply. No novel or clever solutions
where a conventional approach exists. New patterns MUST be documented and
applied consistently going forward. Code that surprises the reader requires
written justification.

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

## Development Workflow

- Features start with spec → plan → task generation **before** implementation.
- Each task MUST reference its user story and phase.
- Security hardening and error handling MUST be part of every implementation
  phase, not optional polish.
- Moderation-pipeline tasks MUST include a Prisma migration task (the `role`
  field plus report and violation tables) before any mod or admin UI or route
  work begins.

## Deferred Principles

### AI Service Abstraction (not yet active)
No AI feature is mandated yet. This principle auto-promotes to a Core
Principle when the first AI spec lands. When active:

- AI calls MUST sit behind a dedicated service interface.
- The provider MUST be swappable without business-logic changes.
- AI unavailability MUST NOT block core user flows.

## Governance

This constitution supersedes all other coding conventions and informal
agreements.

Amendments require: a written proposal with rationale, a semver version bump,
a `LAST_AMENDED_DATE` update, and a propagation check against all
`.specify/templates/*.md` files.

All implementation plans MUST include a **Constitution Check** section
validating the design against these principles before Phase 0 research.
Non-compliance MUST be justified in the plan's Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-06-30 | **Last Amended**: 2026-06-30