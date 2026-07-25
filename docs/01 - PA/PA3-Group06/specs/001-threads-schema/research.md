# Research: Threads-Style Community Database Schema

## Decision 1: Use PostgreSQL as the primary persistence layer

- Decision: Model the feature against PostgreSQL-backed relational tables.
- Rationale: The proposal centers on durable community data, moderation history, and high-volume engagement, all of which benefit from relational integrity and explicit foreign keys.
- Alternatives considered: Document storage was considered but rejected because it weakens referential integrity and makes duplicate-prevention rules harder to enforce consistently.

## Decision 2: Separate identities, profiles, content, engagement, and moderation records

- Decision: Keep user identity, profile data, posts, comments, reactions, reports, moderation reviews, role history, and summaries as separate entities.
- Rationale: The proposal requires ownership, report handling, and AI summaries to remain inspectable over time without losing history when content changes or is removed.
- Alternatives considered: Nested or embedded records were considered but rejected because they blur lifecycle boundaries and complicate audit trails.

## Decision 3: Store role and lifecycle changes as persisted history

- Decision: Represent current role and historical role transitions as stored records rather than derived UI state.
- Rationale: Moderator and administrator workflows depend on durable role assignment history and current access state.
- Alternatives considered: A single mutable role flag was considered but rejected because it would not preserve transitions over time.

## Decision 4: Enforce uniqueness for reactions and preserve moderation traceability

- Decision: Model reactions with uniqueness constraints by target and user, and store reports with review outcomes and escalation history.
- Rationale: The feature needs duplicate-like prevention, moderation accountability, and a reliable state trail for removed or disputed content.
- Alternatives considered: Application-only duplicate checks were rejected because the schema itself should prevent conflicting records.

## Decision 5: Store AI summaries as separate records tied to posts

- Decision: Persist AI-generated TL;DR summaries in their own table or equivalent record type linked to the source post.
- Rationale: This preserves the original post unchanged and allows summaries to be refreshed, hidden, or replaced independently.
- Alternatives considered: Overwriting post content with summaries was rejected because it destroys the source of truth and breaks auditability.
