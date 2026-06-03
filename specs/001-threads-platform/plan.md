# Implementation Plan: Threads Platform — Core MVP

**Branch**: `001-threads-platform` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-threads-platform/spec.md`

## Summary

A web-based social platform replicating the core experience of Threads.com.
Five predefined users (no auth) can post text threads (≤500 chars + 1 image),
reply to threads, like/unlike content, and follow/unfollow other users. Like
and reply counts update in real time via Socket.io. The feed is reverse-
chronological with infinite scroll and an in-app refresh control. Content is
pre-seeded at startup.

**Technical approach**: React + Vite SPA (client) backed by a Node.js + Express
REST API with Socket.io for real-time events, Prisma ORM over MS SQL Server,
and a TypeScript codebase on both sides.

## Technical Context

**Language/Version**: TypeScript 5.x (client and server)

**Primary Dependencies**:
- Client: React 18, Vite 5, React Router v6, TanStack Query v5,
  Tailwind CSS 3, Socket.io-client
- Server: Node.js 20 LTS, Express 4, Socket.io 4, Prisma 5,
  Multer (image upload), cors, dotenv

**Storage**: MS SQL Server (via Prisma ORM). Prisma schema is the single source
of truth for the data model. Migrations managed with `prisma migrate dev`.

**Testing**: Vitest (unit, both client and server). No E2E testing in this phase.

**Target Platform**: Web browser (desktop + mobile responsive). Served as a
Vite-built SPA from the Express server or a separate Vite dev server.

**Project Type**: Web application — strict client/server split (constitution
requirement). Two top-level directories: `client/` and `server/`.

**Performance Goals**:
- Identity selection → feed rendered: < 5s (SC-001)
- New thread/reply visible after post: < 2s (SC-002, SC-003)
- Like/reply count update across sessions: < 3s (SC-004)
- Infinite scroll: next batch loads before reaching absolute bottom (SC-005)

**Constraints**:
- 5 predefined users, prototype trust model (no server-side auth enforcement)
- Replies are one level deep only
- One image attachment per thread (no image on replies)
- Session does not survive browser refresh

**Scale/Scope**: Prototype — 5 users, local/small-network deployment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Modular Client-Server Architecture | ✅ PASS | `client/` and `server/` are completely separate; no shared runtime code |
| II. Enforced Folder Structure | ✅ PASS | Structure defined below and enforced throughout |
| III. Clean Code & Reusability | ✅ PASS | React component hierarchy planned; centralized Express error middleware; reusable hooks |
| IV. Security at Every Layer | ✅ PASS | UI gates all ownership-dependent actions; active user validated from session on every mutating request |
| V. AI Service Abstraction | ✅ N/A | No AI features in this phase |
| VI. Consistency Over Cleverness | ✅ PASS | Standard REST + Socket.io patterns; no novel approaches |

**Gate result**: All applicable principles pass. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-threads-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── rest-api.md      # Phase 1 output
│   └── socket-events.md # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/
│   │   ├── feed/           ← FeedList, FeedItem, InfiniteScrollTrigger
│   │   ├── thread/         ← ThreadCard, ThreadCompose, ThreadActions
│   │   ├── reply/          ← ReplyList, ReplyCard, ReplyCompose
│   │   ├── user/           ← UserSelectScreen, UserAvatar, FollowButton
│   │   └── common/         ← LikeButton, DeleteButton, ImageUpload, EmptyState
│   ├── pages/
│   │   ├── UserSelectPage.tsx
│   │   └── FeedPage.tsx
│   ├── services/
│   │   ├── api.ts          ← typed fetch wrappers for all REST endpoints
│   │   └── socket.ts       ← Socket.io client singleton
│   ├── hooks/
│   │   ├── useFeed.ts      ← infinite scroll + TanStack Query integration
│   │   ├── useLike.ts
│   │   ├── useFollow.ts
│   │   └── useSession.ts
│   ├── store/
│   │   └── sessionStore.ts ← active user (Zustand)
│   └── types/
│       └── index.ts        ← shared domain types (User, Thread, Reply, Like)
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json

server/
├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   ├── threads.ts
│   │   ├── replies.ts
│   │   ├── likes.ts
│   │   └── follows.ts
│   ├── services/
│   │   ├── threadService.ts
│   │   ├── replyService.ts
│   │   ├── likeService.ts
│   │   └── followService.ts
│   ├── middleware/
│   │   ├── errorHandler.ts ← centralized error handler (constitution III)
│   │   └── activeUser.ts   ← validates session user on mutating routes
│   ├── socket/
│   │   └── handlers.ts     ← Socket.io event emitters
│   └── app.ts              ← Express app entry point
├── prisma/
│   ├── schema.prisma
│   └── seed.ts             ← pre-seeded users, threads, replies
├── uploads/                ← local image storage (prototype)
├── tsconfig.json
└── package.json
```

**Structure Decision**: Web application Option 2 (client + server). Chosen
because the constitution mandates strict client/server separation and the
feature requires both a browser SPA and a persistent data/real-time backend.

## Complexity Tracking

> No constitution violations. No complexity justification required.
