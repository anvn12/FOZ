# Feature Specification: Test Databases and Fixture Datasets

**Feature Branch**: `025-test-databases`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "Setup 2 different databases for testing: 1 with no posts; 1 with 100 posts, 50 users and have interactions in the posts (comments, reposts, like, reply...). All these databases are different from the current databases, can only be run on testing (maybe run through some special scripts). The moderator account is with email and password is \"mod@mod.foz\", admin is \"admin@admin.foz\"."

## Clarifications

### Session 2026-08-17
- Q: How should the two test database environments be structured and accessed within the PostgreSQL service? → A: Dedicated separate databases (`foz_test_empty` and `foz_test_populated`) provisioned within the local PostgreSQL instance.
- Q: How should the post timestamps and interaction density be distributed across the 50 synthetic users? → A: Realistic historical spread across the past 30 days with weighted activity (multi-level comment trees, popular posts with higher reaction counts, and varied author activity).
- Q: How should developers and automated test runners trigger the creation and resetting of each test database? → A: Dedicated cross-platform npm scripts in package.json (e.g., `npm run db:test:setup`, `npm run db:test:empty:reset`, `npm run db:test:populated:reset`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empty State Test Database Provisioning (Priority: P1)

As a software tester or backend engineer,
I want a dedicated, clean test database (`foz_test_empty`) pre-configured with essential system roles but zero user posts or interactions via npm scripts,
So that I can verify zero-data boundary conditions, empty feed UI behaviors, fresh user onboarding, and isolated test cases without residual data interference.

**Why this priority**: Empty state testing is critical for regression testing, first-time user experiences, and ensuring test suites can assert exact single-record insertions without noise from pre-existing records.

**Independent Test**: Can be independently verified by executing `npm run db:test:empty:reset`, then validating that `foz_test_empty` contains the required system accounts (Admin, Moderator) while confirming the total count of posts, comments, reactions, and user-generated interactions is exactly zero.

**Acceptance Scenarios**:

1. **Given** a testing environment targeting empty-state testing, **When** `npm run db:test:empty:reset` is executed, **Then** the `foz_test_empty` database is created and migrated with up-to-date schemas, and the post count is 0.
2. **Given** `foz_test_empty` is active, **When** querying for administrative accounts, **Then** the moderator account (`mod@mod.foz`) and admin account (`admin@admin.foz`) exist with active statuses and their respective roles.
3. **Given** an automated test run that created transient records in `foz_test_empty`, **When** the reset procedure is invoked, **Then** the database is restored back to its baseline empty state with zero posts.

---

### User Story 2 - Populated Interaction Test Database Provisioning (Priority: P1)

As a quality assurance engineer or full-stack developer,
I want a dedicated populated test database (`foz_test_populated`) containing 50 users, 100 posts, and rich multi-level interactions (comments, nested replies, reposts, likes/reactions, hashtags, and moderation reports) distributed realistically over time via npm scripts,
So that I can realistically test feed algorithms, chronological sorting, pagination, search, moderation workflows, and interaction dynamics against representative dataset volumes.

**Why this priority**: Testing complex features like timeline sorting, interaction graphs, content moderation queues, and hashtag filtering requires substantial, interconnected relational data that mimics real community activity.

**Independent Test**: Can be independently verified by executing `npm run db:test:populated:reset`, then validating that `foz_test_populated` contains exactly 50 active user accounts, 100 posts with timestamps distributed over the past 30 days, valid multi-tier comment trees (including replies), repost chains, and distributed reactions.

**Acceptance Scenarios**:

1. **Given** a testing environment targeting populated testing, **When** `npm run db:test:populated:reset` is executed, **Then** the `foz_test_populated` database contains exactly 50 distinct user profiles and accounts, and at least 100 posts across authors with timestamps spanning the previous 30 days.
2. **Given** `foz_test_populated` is active, **When** inspecting posts, **Then** a representative subset of posts contains multi-level comments, nested replies (parent-child comment relationships), repost references, and reactions (likes).
3. **Given** `foz_test_populated` is active, **When** inspecting user roles and moderation entities, **Then** the moderator (`mod@mod.foz`) and admin (`admin@admin.foz`) accounts exist alongside standard users, and sample moderation reports exist for verification of moderation workflows.
4. **Given** tests modify or delete records in `foz_test_populated`, **When** the reset procedure is invoked, **Then** the dataset is re-seeded deterministically back to its baseline state of 50 users and 100 posts.

---

### User Story 3 - Deterministic Test Authentication and Role Verification (Priority: P2)

As an automated test runner or manual tester,
I want standardized, predictable login credentials for all system roles across both test databases,
So that tests can reliably authenticate as an Administrator, Moderator, or Standard User without dynamic credential generation overhead.

**Why this priority**: Hardcoded or predictable test credentials for key roles prevent brittle test setups and allow both automated suites and manual exploratory testers to immediately exercise role-specific permission checks.

**Independent Test**: Can be independently verified by performing an authentication challenge against either test database using `mod@mod.foz` / `mod@mod.foz` for the Moderator role and `admin@admin.foz` / `admin@admin.foz` for the Admin role, confirming successful token issuance with correct role claims.

**Acceptance Scenarios**:

1. **Given** either `foz_test_empty` or `foz_test_populated` is targeted, **When** an authentication request is sent with email `mod@mod.foz` and password `mod@mod.foz`, **Then** authentication succeeds and the user identity has the `moderator` role.
2. **Given** either `foz_test_empty` or `foz_test_populated` is targeted, **When** an authentication request is sent with email `admin@admin.foz` and password `admin@admin.foz`, **Then** authentication succeeds and the user identity has the `admin` role.
3. **Given** `foz_test_populated` is targeted, **When** authenticating with any generated standard test user, **Then** the user authenticates with a known predictable test password and possesses the `user` role.

---

### User Story 4 - Environment Isolation and Guardrails (Priority: P3)

As a developer working locally,
I want test database operations and datasets to be strictly isolated from the primary development database (`foz_dev`),
So that running testing routines or destructive seed resets never corrupts or deletes working development data.

**Why this priority**: Prevents catastrophic data loss during test runs and ensures development workflows and test runs can proceed in parallel without port or database collision.

**Independent Test**: Can be independently verified by modifying data in the development database, running a full test database reset/provisioning cycle, and confirming `foz_dev` remains completely unaffected.

**Acceptance Scenarios**:

1. **Given** active data in the primary development database (`foz_dev`), **When** the test database provisioning or reset procedures are executed, **Then** no modifications, table drops, or truncations occur on `foz_dev`.
2. **Given** test execution scripts are invoked without explicit test environment configuration, **Then** the system aborts execution with a safety error preventing execution against non-test databases.

---

### Edge Cases

- **Schema Desynchronization**: How does the system handle when the application schema evolves with new migrations? The test database provisioning procedure must apply all pending migrations to both `foz_test_empty` and `foz_test_populated` before seeding to ensure test databases always reflect current schema definitions.
- **Foreign Key Cascade and Circular References**: How are complex interaction graphs (reposts of deleted posts, replies to parent comments, self-reactions) handled during seeding? Data generation must respect relational integrity constraints and acyclic dependencies.
- **Deterministic vs Random Generation**: How does the system ensure repeatable test runs? Seeding logic must use a fixed random seed or deterministic generators so that repeated runs generate identical record IDs, relationships, and content structures for predictable assertions.
- **Accidental Production/Dev Execution**: What happens if a reset command is invoked against `foz_dev` or a live environment? Safety checks must inspect the database target name and refuse to run if the target is not explicitly identified as `foz_test_empty` or `foz_test_populated`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an isolated **Empty State Test Database** named `foz_test_empty` containing all current database schemas, constraints, and migrations.
- **FR-002**: The `foz_test_empty` database MUST contain exactly zero posts, zero comments, zero reactions, zero reports, and zero hashtags upon initial provisioning.
- **FR-003**: The `foz_test_empty` database MUST include a predefined Moderator account with email `mod@mod.foz`, password `mod@mod.foz`, and `moderator` role.
- **FR-004**: The `foz_test_empty` database MUST include a predefined Administrator account with email `admin@admin.foz`, password `admin@admin.foz`, and `admin` role.
- **FR-005**: System MUST provide an isolated **Populated Interaction Test Database** named `foz_test_populated` containing all current database schemas, constraints, and migrations.
- **FR-006**: The `foz_test_populated` database MUST contain exactly 50 distinct user accounts with associated profile records (display name, avatar, bio, status).
- **FR-007**: The `foz_test_populated` database MUST contain at least 100 posts authored across the generated users, with creation timestamps distributed over the preceding 30 days.
- **FR-008**: The `foz_test_populated` database MUST include realistic multi-type interactions distributed among posts, including:
  - Direct comments and nested replies (multi-level comment trees).
  - Reposts referencing original parent posts.
  - Reactions (likes) across posts and comments by various test users.
  - Hashtag associations attached to post content.
  - Sample moderation reports linked to posts and users for moderation workflow testing.
- **FR-009**: The `foz_test_populated` database MUST include the identical predefined Moderator (`mod@mod.foz`) and Administrator (`admin@admin.foz`) accounts with their respective roles.
- **FR-010**: All standard test users in the populated database MUST have standardized, predictable credentials to allow automated authentication during integration testing.
- **FR-011**: Both `foz_test_empty` and `foz_test_populated` MUST be distinct from the default local development database (`foz_dev`) and must only be accessible/executed within testing contexts.
- **FR-012**: System MUST provide dedicated cross-platform npm scripts (`npm run db:test:setup`, `npm run db:test:empty:reset`, `npm run db:test:populated:reset`) to provision, seed, and reset each test database independently on demand.
- **FR-013**: System MUST enforce safety guardrails preventing any seed or test reset scripts from executing against non-testing database environments.

### Key Entities *(include if feature involves data)*

- **Test Database Configuration**: Environment and connection definitions distinguishing `foz_test_empty` and `foz_test_populated` from `foz_dev`.
- **System Role Account**: Core operational accounts with predefined roles (`admin`, `moderator`) and deterministic credentials.
- **Synthetic Test User**: Realistic user account entity with linked profile data (display name, bio, avatar reference) used for load and interaction testing.
- **Synthetic Post & Content**: Post entities containing varied text content, chronological timestamps (30-day spread), lifecycle states, and hashtag references.
- **Interaction Graph**: Relational structure mapping reactions, reposts, comments, and replies between synthetic users and posts.
- **Moderation Report Fixture**: Sample reports documenting flagged content or users to support testing of the moderation review queue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `foz_test_empty` database can be completely provisioned from scratch or reset in under 5 seconds via `npm run db:test:empty:reset`.
- **SC-002**: The `foz_test_populated` database (50 users, 100 posts, associated interactions) can be fully generated and seeded in under 15 seconds via `npm run db:test:populated:reset`.
- **SC-003**: 100% of seeded posts, comments, reactions, and users in `foz_test_populated` satisfy all relational integrity and foreign key constraints.
- **SC-004**: Authentication requests using `mod@mod.foz` and `admin@admin.foz` achieve a 100% success rate with verified role assignments in both test databases.
- **SC-005**: 0% accidental contamination or data loss occurs on the primary development database (`foz_dev`) during repeated test database provisioning and teardown cycles.
- **SC-006**: Automated test suites or manual testing sessions can switch between `foz_test_empty` and `foz_test_populated` with a single command or configuration flag.

## Assumptions

- Test databases (`foz_test_empty` and `foz_test_populated`) run within the project's local PostgreSQL 16 container instance alongside `foz_dev`.
- Password hashes for test accounts are generated using bcrypt at an optimized test cost factor (`BCRYPT_COST=4`) for fast test execution and authentication.
- Synthetic user names, bios, and post contents are family-friendly, readable mock text suitable for UI demonstration and automated test verification.
- Media attachments in the populated database use valid placeholder URL patterns without requiring external cloud storage uploads during seed time.
- Standard test users in the populated database use a uniform credential convention (`user1@foz.test` through `user50@foz.test` with password `password123`).
