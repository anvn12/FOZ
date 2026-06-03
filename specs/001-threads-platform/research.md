# Research: Threads Platform — Core MVP

**Phase**: 0 | **Date**: 2026-06-04 | **Plan**: [plan.md](./plan.md)

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## Decision 1: Frontend Framework

**Decision**: React 18 with Vite 5

**Rationale**: React's component model maps directly to the feed/thread/reply
hierarchy in this feature. Vite provides near-instant HMR and fast production
builds. The ecosystem (TanStack Query, React Router, Zustand) covers all
required concerns without custom solutions.

**Alternatives considered**:
- Vue 3: Also excellent with Vite, but React has broader adoption and the user
  expressed TypeScript preference — React's TS support is more mature.
- Next.js: SSR overkill for a prototype SPA with no SEO requirements.

---

## Decision 2: Backend Framework

**Decision**: Express 4 with TypeScript via `ts-node-dev` (dev) / compiled JS (prod)

**Rationale**: Express is the most documented Node.js framework, minimal
learning curve, and has first-class TypeScript support. The project is a
prototype — Fastify's performance advantages are irrelevant at this scale.

**Alternatives considered**:
- Fastify: Faster but less familiar; performance not needed at prototype scale.
- NestJS: Too opinionated and heavy for a focused prototype.

---

## Decision 3: Real-Time Layer

**Decision**: Socket.io 4 (server) + socket.io-client (browser)

**Rationale**: Socket.io handles WebSocket with automatic fallback to polling,
room management, and reconnection out of the box. The real-time requirement is
scoped to like/reply count updates — a pub/sub broadcast model maps perfectly.
New thread visibility is NOT real-time (spec decision Q4), so complexity is
contained.

**Pattern**: A single global Socket.io room (`global-feed`). All connected
clients join on connection. The server emits targeted count-update events after
any mutating operation (like/unlike, reply/delete). Clients update local
TanStack Query cache on receipt.

**Alternatives considered**:
- Native WebSocket API: More effort for reconnection and room management.
- Server-Sent Events: One-directional only; does not scale to future bidirectional needs.

---

## Decision 4: ORM & Database Access

**Decision**: Prisma 5 over MS SQL Server

**Rationale**: Prisma provides a type-safe query API generated from schema,
first-class MS SQL Server support, migration management (`prisma migrate dev`),
and a seeding mechanism (`prisma db seed`) which is required by the spec
(pre-seeded data). The schema acts as a single source of truth for the data
model.

**Alternatives considered**:
- TypeORM: More complex configuration, decorator-heavy, weaker type inference.
- Raw SQL (mssql driver): No migration management, no type safety — unacceptable for clean code principle.
- Sequelize: JavaScript-first, weaker TypeScript support than Prisma.

---

## Decision 5: Client-Side State Management

**Decision**: Two-layer approach — TanStack Query v5 for server state, Zustand for session state

**Rationale**:
- **TanStack Query**: Manages all server-fetched data (feed, threads, replies).
  Provides caching, background refetch, and infinite query support natively —
  essential for the infinite scroll feed (SC-005). Mutations (post, like, delete)
  invalidate relevant queries automatically.
- **Zustand**: Manages the single piece of client-only state — the currently
  selected user. Simple, no boilerplate, persists for session duration.

**Alternatives considered**:
- Redux Toolkit: Over-engineered for this scope.
- React Context alone: No caching or background refetch capabilities.

---

## Decision 6: Styling

**Decision**: Tailwind CSS 3

**Rationale**: Utility-first approach enables rapid UI construction consistent
with a Threads-like design. No context-switching between CSS files and
components. Mobile-responsive by default via breakpoint utilities.

**Alternatives considered**:
- CSS Modules: More verbose, slower to prototype.
- Styled Components: Runtime CSS-in-JS adds unnecessary overhead.

---

## Decision 7: Image Upload (Prototype)

**Decision**: Multer (Express middleware) storing images to `server/uploads/`
served as static files via Express.

**Rationale**: Local file storage is the simplest prototype-appropriate
approach. Multer integrates natively with Express, handles `multipart/form-data`
parsing, and enforces file type and size validation at the middleware layer
(constitution III: centralized error handling).

**Constraints**:
- Accepted formats: JPEG, PNG, GIF, WebP
- Max file size: 5 MB (enforced by Multer, user-readable error on rejection)
- Path stored in DB as a relative URL: `/uploads/<filename>`

**Alternatives considered**:
- AWS S3 / cloud storage: External dependency, requires credentials — not
  appropriate for a local prototype.

---

## Decision 8: Session Mechanism

**Decision**: Express `express-session` with in-memory store (prototype only).
Active user ID stored in the server session. Every mutating request reads
`req.session.userId` via the `activeUser` middleware.

**Rationale**: Provides a server-authoritative session (even though ownership
enforcement is prototype trust, the session still identifies the acting user
for all operations). Simple, zero-config for prototype.

**Constraints**: Session is lost on server restart (in-memory). Acceptable per
spec — session does not survive page refresh anyway.

**Alternatives considered**:
- JWT in localStorage: Client-side only, no server-side session control.
- Cookie-less: Would require userId passed in every request body — error-prone.

---

## Decision 9: Testing

**Decision**: Vitest for unit tests on both client and server.

**Rationale**: Vitest is Vite-native, shares configuration with the frontend,
and has a Jest-compatible API so the same patterns apply on both sides.
No E2E testing in this phase (out of scope).

**Alternatives considered**:
- Jest: Requires separate Babel/TS transform config for each project.

---

## Resolution Summary

| Unknown | Resolved To |
|---|---|
| Testing framework | Vitest (both sides) |
| Session mechanism | express-session (in-memory, prototype) |
| Image storage | Multer → local `server/uploads/` |
| Client state | TanStack Query (server) + Zustand (session) |
| Real-time architecture | Socket.io global room, count-update events only |
| Styling | Tailwind CSS 3 |

All NEEDS CLARIFICATION items resolved. Proceeding to Phase 1.
