# FOZ — Threads Platform (Prototype)

Web-based social platform replicating core Threads.com experience: predefined users, feed, threads, replies, likes, follows, and real-time count updates.

## Stack

- **Client**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, Socket.io-client
- **Server**: Node.js, Express, TypeScript, Prisma, Socket.io, MS SQL Server

## Structure

```text
client/     # SPA (Vite + React)
server/     # API + Socket.io + Prisma
specs/001-threads-platform/   # Spec Kit artifacts (spec, plan, tasks, contracts)
```

## Quick start

See **[specs/001-threads-platform/quickstart.md](specs/001-threads-platform/quickstart.md)** for full setup (database, seed, run, verify).

```bash
# Server
cd server && cp .env.example .env   # edit DATABASE_URL
npm install && npx prisma migrate dev && npx prisma db seed
npm run dev

# Client (separate terminal)
cd client && npm install && npm run dev
```

Open http://localhost:5173 — pick one of five users, then use the feed.

## Current MVP scope (001-threads-platform)

- Five predefined users, no passwords
- Global feed, infinite scroll, in-app refresh
- Post threads (≤500 chars + optional image)
- Replies with visual thread connector
- Like/unlike (real-time counts via Socket.io)
- Follow/unfollow
- Delete own content only (UI-gated, prototype trust model)

Out of scope for this feature: auth, editing posts, AI summarization, admin tools.
