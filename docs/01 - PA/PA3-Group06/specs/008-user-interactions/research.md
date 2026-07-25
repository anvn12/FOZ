# Research & Architectural Decisions: User Interactions

This document records the core planning decisions for the interaction slice covering posts, comments, replies, ownership-based editing/deletion, and like/unlike toggles.

## Decision 1: Resource Router Split

- **Decision**: Split the backend into resource routers for posts, comments, and reactions under `src/backend/api/`, then mount them once under `/api/v1` via the existing `apiRouter` in `src/backend/index.ts`.
- **Rationale**: This matches the repo’s routing convention, keeps each resource focused, and avoids a monolithic interactions router that would mix independent responsibilities.
- **Alternatives Considered**: A single `interactions` router was rejected because it would become a catch-all for unrelated mutation paths and make future moderation/reporting routes harder to isolate.

## Decision 2: Shared Contracts in `src/shared/`

- **Decision**: Define the interaction request/response Zod schemas in `src/shared/schemas/interactions.ts` and export the corresponding TypeScript types from the same module.
- **Rationale**: The constitution requires shared schemas as the single source of truth. Keeping post, comment, and reaction payloads in one shared contract module prevents the frontend and backend from drifting.
- **Alternatives Considered**: Duplicating DTOs in frontend and backend was rejected because it would violate the shared-schema rule and create avoidable maintenance overhead.

## Decision 3: Ownership and Deletion Semantics

- **Decision**: Treat post and comment deletions as visibility changes with cascade hiding of dependent thread content and reaction state.
- **Rationale**: The feature requires deleted content to disappear from public view and stop accepting interactions. A visibility-based delete preserves thread integrity, avoids dangling replies, and keeps ownership checks consistent with the rest of the app.
- **Alternatives Considered**: Hard deletion was rejected because it makes thread reconstruction, moderation review, and reaction cleanup more fragile.

## Decision 4: Frontend Interaction Pattern

- **Decision**: Use React Query mutations for post/comment/reaction state changes, with local optimistic updates where the action is reversible (likes/unlikes) and standard invalidation for post/comment edits or deletions.
- **Rationale**: This keeps the visible thread responsive while still allowing the backend to remain the source of truth. Optimistic toggles are especially useful for reactions because they are frequent and binary.
- **Alternatives Considered**: Full-page refreshes and manual refetch loops were rejected because they produce slower feedback and duplicate state-management logic.

## Decision 5: Validation Boundary

- **Decision**: Validate all inbound mutation payloads at the API boundary with Zod before any service logic runs.
- **Rationale**: This is required by the constitution and ensures empty/whitespace-only text, invalid parent references, and malformed reactions are rejected consistently.
- **Alternatives Considered**: Deferring validation to service functions was rejected because it would let untrusted payloads travel deeper into the stack and make error handling inconsistent.