# Implementation Plan: Threads-Style Community Database Schema

**Branch**: `[001-threads-schema]` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-threads-schema/spec.md`

**Note**: This plan is written for the schema design phase of the feature. It focuses on the data model, persistence rules, and schema-level support needed by the proposal.

## Summary

Define a database schema for a Threads-style community application that preserves core identity, content, engagement, moderation, and AI summary data in a form that supports ownership checks, role changes, feed ranking, search/discovery, and audit history.

## Technical Context

**Language/Version**: TypeScript ESM, with schema design expressed for a PostgreSQL-backed application

**Primary Dependencies**: PostgreSQL 16, Drizzle, Zod, Express, React, Vitest

**Storage**: PostgreSQL 16

**Testing**: Vitest plus schema-level and migration-level validation

**Target Platform**: Web application

**Project Type**: Web application

**Performance Goals**: Support large content and engagement volumes without redesign; preserve efficient ownership, moderation, and lookup paths

**Constraints**: Must fit the validated `src/frontend/`, `src/backend/`, and `src/shared/` structure; no codegen or tRPC; ownership and role rules must remain enforceable in the schema; moderation history must remain auditable

**Scale/Scope**: Community-scale dataset with posts, comments, reactions, reports, moderation records, and AI summaries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The design respects the `src/frontend/`, `src/backend/`, and `src/shared/` structure required by the constitution.
- The schema is centered on PostgreSQL and Drizzle, matching the validated backend stack.
- Cross-cutting data contracts belong in `src/shared/` if schema validation artifacts are needed later.
- Authentication, ownership, and moderation state are represented as first-class data concerns.
- AI summary storage is isolated from core post content, matching the AI service boundary principle.
- No constitution violations are required for this feature; the plan does not introduce extra project layers or alternate persistence patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-threads-schema/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── README.md
```

### Source Code (repository root)

```text
src/
├── frontend/
├── backend/
└── shared/
```

**Structure Decision**: Keep the feature as documentation-first under `specs/001-threads-schema/`, with any future runtime schema or migration work implemented inside the validated `src/backend/` and `src/shared/` layers. No additional top-level project areas are required for this planning pass.

## Phase 0 Research

### Decisions

- Use PostgreSQL as the system of record for all user, content, engagement, moderation, and AI summary entities.
- Treat posts, comments, reactions, reports, moderation reviews, role history, and summaries as separate tables or records with explicit foreign-key relationships.
- Represent roles and lifecycle states as durable stored values rather than derived UI-only flags.
- Preserve moderation and deletion history so audit trails survive content removal.
- Use schema-level uniqueness and referential integrity to prevent duplicate reactions and broken references.

### Rationale

- The proposal requires reliable discussion data, moderation workflows, and historical accountability.
- The constitution requires ownership enforcement, moderation logging, and a binding PostgreSQL/Drizzle backend.
- Separate records make search, feed ranking, and AI summary storage easier to reason about and validate.

### Alternatives Considered

- Storing everything in a single denormalized document was rejected because it would weaken ownership checks, moderation history, and auditability.
- Embedding reactions and reports directly inside post rows was rejected because it would complicate uniqueness guarantees and make high-volume access harder to maintain.
- Deferring role history was rejected because the proposal explicitly calls for moderator and administrator workflows that need durable state.

## Phase 1 Design

### Data Model

See [data-model.md](./data-model.md) for entity definitions, fields, relationships, and validation rules.

### Contracts

The feature does not expose a new external API contract. If runtime schema helpers are needed later, they should live in `src/shared/` and follow the same validation rules documented here.

### Quickstart

See [quickstart.md](./quickstart.md) for a lightweight review and validation flow for the schema design.

## Re-check Constitution

- The final design keeps the shared-contract boundary intact.
- The schema remains compatible with the approved backend stack.
- The model supports moderation auditability, ownership checks, and AI degradation without blocking core flows.
- No unresolved constitution gate issues remain for this feature.
