# Backend Tech Stack

Status: Validated through brainstorming. Ready to feed into a spec / implementation.  
Author: Võ An Phú and AI brainstorming session

This is an ideas file, not a spec. It records the validated decisions and the
reasoning behind each, so the backend lead can turn it into a formal spec or
scaffold without re-litigating choices. Companion to
`docs/frontend/techstack.md`.

> The governing decision: **TypeScript on both sides.** The two features that
> could have pulled toward Python (AI TL;DR, trending recommendation) are both
> non-ML — one is an outbound HTTP call to an LLM provider, the other is a SQL
> scoring query. Python's AI/ML ecosystem is real but irrelevant to our scope.
> TS-for-both wins on: shared types across `src/frontend` and `src/backend`,
> one toolchain for a 5-person team on a deadline.

## Initial stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js (current LTS), ESM, `.nvmrc` pin |
| Web framework | Express + hand-wired Zod validation middleware + central error handler |
| Database | PostgreSQL 16, via `docker-compose.yml` |
| ORM / query layer | Drizzle (SQL-visible), `drizzle-kit` for migrations |
| Live updates | No push-based realtime layer — the product has no chat or live notification stream. `@tanstack/react-query` refetch/polling on the frontend covers every actual live-update need |
| Auth | JWT access (15min, client memory) + refresh (7day, http-only `SameSite=Lax` cookie); bcrypt; `role` column + hardcoded permission matrix |
| Social login | OAuth 2.0 authorization-code flow (Google today), `user_social_links` table, issues the same JWT access + refresh session as password auth; mock/test identity-override paths gated to non-production `NODE_ENV` |
| AI / TL;DR | One file, `for` loop over `fetch`-based provider and/or model candidates (currently multiple Gemini model tiers), pure-function prompt, local non-AI fallback if the chain is exhausted, no cache/streaming in v1 |
| Trending / feed | SQL scoring `(likes×1 + comments×1.5 + velocity×3) × EXP(-age_hours/48)`, 30s in-process single-flight cache, 2 indexes |
| Shared types | `src/shared/` Zod schemas as source of truth, path aliases (no workspace package), no codegen/tRPC |
| Validation | Zod at inbound trust boundaries only |
| Config | Zod-validated env, fail-fast at startup |
| Tests | Vitest — tier-1 pure unit tests (the self-checks), tier-2 integration for auth + feed <500ms NFR, no E2E |

---
