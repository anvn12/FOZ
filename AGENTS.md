# AGENTS.md — FOZ Threads Platform

## Repo structure

- Two independent npm packages, **no monorepo tool**. Install and run separately.
  - `client/` — Vite + React 18 SPA
  - `server/` — Express + Prisma + Socket.io API
  - `specs/001-threads-platform/` — Spec Kit artifacts (not code)

## First-time setup

1. **Database** must be **MS SQL Server** (not Postgres). Create `foz_dev` DB.
2. `cd server && npm install`
3. `cd client && npm install`
4. `cd server && npx prisma migrate dev && npx prisma db seed`
   - Seed creates 5 predefined users, sample threads, replies, likes, follows.

## Dev workflow (two terminals)

```bash
# Terminal 1
$ cd server && npm run dev       # Express + Socket.io on :3000 (tsx watch)

# Terminal 2
$ cd client && npm run dev      # Vite on :5173
```

Open http://localhost:5173, pick a predefined user.

## Environment quirks

- `server/.env` exists in the working tree but is gitignored by `server/.gitignore`.
- `CLIENT_URL` in `server/.env` must match the Vite dev server URL exactly or CORS breaks.
- Client env: `VITE_API_URL=http://localhost:3000` (see `client/.env.example`).

## Build & deploy

```bash
# Client
cd client && npm run build      # tsc --noEmit && vite build → dist/

# Server
cd server && npm run build      # tsc → dist/
cd server && npm start          # node dist/app.js
```

## Testing

- Both packages have `npm test` → Vitest.
- **No test files exist yet** in either package.

## Database / Prisma

- `npx prisma migrate dev` — create/apply migrations
- `npx prisma db seed` — re-seed (runs `prisma/seed.ts` via tsx)
- `npx prisma studio` — visual DB browser
- `npx prisma generate` — regenerate client after schema changes

## Auth model

- **No real authentication**. Five hardcoded users, no passwords.
- Identity is selected in the UI and stored in an Express session.
- Users can only delete their own content (enforced in UI + API).

## Architecture notes

- Server entry: `server/src/app.ts` (Express app + Socket.io on shared HTTP server).
- Client entry: `client/src/main.tsx` (StrictMode, QueryClient, BrowserRouter, socket init).
- Image uploads stored in `server/uploads/` and served statically at `/uploads/<filename>`.
- Socket.io drives real-time like-count updates across tabs.

## Conventions

- Both packages use `type: "module"` (ESM).
- Server tsconfig: `module: "Node16"`, `moduleResolution: "Node16"`.
- Client tsconfig: `moduleResolution: "bundler"`, `noEmit: true`, `allowImportingTsExtensions: true`.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
