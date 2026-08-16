# Implementation Plan: Test Databases and Fixture Datasets

**Branch**: `025-test-databases` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-test-databases/spec.md`

## Summary

Provision two isolated PostgreSQL testing databases (`foz_test_empty` with 0 posts and admin/moderator roles; `foz_test_populated` with 50 users, 100 posts, and rich multi-level interactions) inside the local PostgreSQL 16 instance. Implement type-safe Drizzle seeding engines and cross-platform npm scripts (`db:test:setup`, `db:test:empty:reset`, `db:test:populated:reset`) with strict safety guardrails that protect the development database (`foz_dev`).

## Technical Context

**Language/Version**: Node.js LTS (>=24), TypeScript ESM  
**Primary Dependencies**: Drizzle ORM (`drizzle-orm`), `postgres`, `bcrypt`, `tsx`  
**Storage**: PostgreSQL 16 (running via `docker-compose.yml`)  
**Testing**: Vitest integration tests, automated assertion suites  
**Target Platform**: Local Node.js development and CI/CD environments  
**Project Type**: Backend database tooling & test infrastructure  
**Performance Goals**: Empty reset in <5 seconds; Populated generation in <15 seconds  
**Constraints**: Zero contamination of `foz_dev`; 100% referential integrity across relational trees  
**Scale/Scope**: 2 test databases, 52 total synthetic accounts, 100 posts, ~150 comments/replies, ~300 reactions  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Modular Architecture)**: All database provisioning and seeding logic resides exclusively in `src/backend/db/`.
- [x] **Principle II (Enforced Folder Structure)**: Files placed in canonical locations: `src/backend/db/scripts/` for CLI runners and `src/backend/db/seeds/` for seed engines.
- [x] **Principle III (Clean Code & Reusability)**: Shared topological seed helper functions and centralized database connection management.
- [x] **Principle IV (Security at Every Layer)**: Hardcoded assertion guardrails prevent execution against non-test databases; bcrypt password hashing with configurable cost factor (`BCRYPT_COST=4`).
- [x] **Principle V (Consistency Over Cleverness)**: Uses standard Drizzle schemas and standard `package.json` npm scripts.
- [x] **Principle VI (AI Service Boundaries)**: N/A (backend tooling).
- [x] **Principle VII (Accessibility)**: N/A (backend tooling).

## Project Structure

### Documentation (this feature)

```text
specs/025-test-databases/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 technical research
├── data-model.md        # Phase 1 data model and volume definitions
├── quickstart.md        # Phase 1 developer quickstart guide
├── contracts/           # Phase 1 interface & CLI contracts
│   └── test-database-cli.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code Layout

```text
src/backend/db/
├── client.ts                               # Drizzle client
├── migrate.ts                              # Migration runner
├── scripts/
│   ├── test-db-guard.ts                    # Safety assertion guardrail
│   ├── test-db-setup.ts                    # Creates & seeds both test DBs
│   ├── test-db-empty-reset.ts              # Resets foz_test_empty (0 posts)
│   ├── test-db-populated-reset.ts          # Resets foz_test_populated (50 users, 100 posts)
│   └── test-db-migrate.ts                  # Migrates both test DBs
└── seeds/
    ├── seed-helpers.ts                     # Password hashing, deterministic UUID generators
    ├── empty-state.seed.ts                 # Admin + Mod seeding (0 posts)
    └── populated-state.seed.ts             # 50 users, 100 posts, comments, reactions, reports
package.json                                # NPM scripts (db:test:setup, db:test:empty:reset, etc.)
```

**Structure Decision**: Retain existing backend structure and add dedicated `src/backend/db/scripts/` and `src/backend/db/seeds/` directories for maintainability and separation of concerns.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | No architectural violations | Standard PostgreSQL multi-database setup and Drizzle ORM seeding |
