---
description: "Task list for Threads Platform — Core MVP"
---

# Tasks: Threads Platform — Core MVP

**Input**: Design documents from `/specs/001-threads-platform/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested in specification — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US7)
- File paths relative to repo root

## Path Conventions

- Client code: `client/src/`
- Server code: `server/src/`
- Prisma: `server/prisma/`
- Uploads: `server/uploads/`

---

## Phase 1: Setup

**Purpose**: Initialize both projects and shared infrastructure scaffolding.

- [ ] T001 Create `client/` and `server/` top-level directories at repo root per plan.md structure
- [ ] T002 Initialize server project: create `server/package.json` (name: foz-server, type: module), install production deps: `express`, `socket.io`, `@prisma/client`, `multer`, `express-session`, `cors`, `dotenv`; install dev deps: `typescript`, `ts-node-dev`, `@types/express`, `@types/node`, `@types/multer`, `@types/express-session`, `@types/cors`, `prisma`, `vitest`
- [ ] T003 [P] Initialize client Vite project: run `npm create vite@latest client -- --template react-ts` from repo root; install additional deps: `react-router-dom`, `@tanstack/react-query`, `zustand`, `socket.io-client`; install dev deps: `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@vitejs/plugin-react`
- [ ] T004 Configure Tailwind CSS in `client/`: run `npx tailwindcss init -p`, set `content` in `client/tailwind.config.ts` to `["./index.html","./src/**/*.{ts,tsx}"]`, add `@tailwind` directives to `client/src/index.css`
- [ ] T005 [P] Create `server/tsconfig.json` with `target: ES2022`, `module: Node16`, `moduleResolution: Node16`, `outDir: dist`, `rootDir: src`, `strict: true`, `esModuleInterop: true`
- [ ] T006 [P] Add npm scripts to `server/package.json`: `"dev": "ts-node-dev --respawn --transpile-only src/app.ts"`, `"build": "tsc"`, `"start": "node dist/app.js"`, `"test": "vitest"`; add `"prisma": { "seed": "ts-node-dev prisma/seed.ts" }`
- [ ] T007 [P] Update `client/vite.config.ts` — add server proxy: forward `/api/*` and `/uploads/*` to `http://localhost:3000`; set `server.port: 5173`
- [ ] T008 [P] Create `server/src/types/express.d.ts` — extend Express `Request` with `user?: { id: string; name: string; avatarUrl: string }` and extend `SessionData` with `userId?: string`
- [ ] T009 [P] Create `client/src/types/index.ts` — define and export TypeScript interfaces: `User`, `Thread`, `Reply`, `Like`, `Follow`, `FeedPage`, `ApiResponse<T>` per data-model.md and rest-api.md
- [ ] T010 [P] Create `server/uploads/.gitkeep` and add `server/uploads/*` (except `.gitkeep`) to `server/.gitignore`; create `server/.gitignore` excluding `node_modules/`, `dist/`, `.env`, `uploads/*`
- [ ] T011 [P] Create `server/.env.example` with: `DATABASE_URL`, `SESSION_SECRET`, `PORT=3000`, `CLIENT_URL=http://localhost:5173`; create `client/.env.example` with `VITE_API_URL=http://localhost:3000`
- [ ] T012 [P] Create root `README.md` (or update existing) with quickstart instructions linking to `specs/001-threads-platform/quickstart.md`

---

## Phase 2: Foundational

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [ ] T013 Write Prisma schema at `server/prisma/schema.prisma` with `sqlserver` datasource, all 5 models (User, Thread, Reply, Like, Follow) exactly as specified in data-model.md; include all `@@unique` constraints and `onDelete: Cascade` relations
- [ ] T014 Run `npx prisma migrate dev --name init` from `server/` to create DB tables and generate Prisma client; commit the generated migration file
- [ ] T015 Create `server/prisma/seed.ts` — seed exactly 5 User records (Alice, Bob, Carlos, Diana, Eve with realistic avatarUrl paths), 15 Thread records distributed across all users with varied createdAt timestamps, 10 Reply records spread across multiple threads, 8 Like records (mix of thread and reply likes, including at least one self-like), 4 Follow records (non-reciprocal)
- [ ] T016 Verify seed runs cleanly: execute `npx prisma db seed` from `server/`; confirm 5 users, 15 threads, 10 replies present via `npx prisma studio`
- [ ] T017 Implement `server/src/middleware/errorHandler.ts` — Express `ErrorRequestHandler` that reads an optional `statusCode` and `code` from the error object, returns `{ error: { message: string, code: string } }` JSON with correct HTTP status; export as default
- [ ] T018 Implement `server/src/middleware/activeUser.ts` — Express `RequestHandler` that reads `req.session.userId`, queries Prisma for the user, attaches to `req.user`; if missing or not found, calls `next({ statusCode: 401, code: "NO_SESSION", message: "No active session" })`
- [ ] T019 Create `server/src/socket/handlers.ts` — export `registerSocketHandlers(io: Server)` that sets up `connection` listener; inside, registers `join-feed` event causing socket to join `"global-feed"` room per socket-events.md
- [ ] T020 Create `server/src/app.ts` — Express app with: `cors` (allow CLIENT_URL, credentials), `express.json()`, `express-session` (secret from env, resave: false, saveUninitialized: false), Multer configured for `server/uploads/` (fileFilter: JPEG/PNG/GIF/WebP, limits: 5 MB), static serving of `/uploads` from `server/uploads/`, HTTP server with Socket.io attached, call `registerSocketHandlers(io)`, mount placeholder routers (to be filled per story), mount `errorHandler` as last middleware; export `io` for use in services; listen on PORT
- [ ] T021 Create `client/src/services/api.ts` — `apiFetch<T>(path, options?)` async function that calls `fetch(path, { credentials: "include", ...options })`, parses JSON, throws structured error if `response.data` absent; export typed helper methods: `get<T>`, `post<T>`, `del<T>` wrapping `apiFetch`
- [ ] T022 Create `client/src/services/socket.ts` — export singleton `socket` created with `io(import.meta.env.VITE_API_URL, { withCredentials: true })`; emit `join-feed` on `connect` event; export `socket` as named export
- [ ] T023 Create `client/src/store/sessionStore.ts` — Zustand store with state `{ activeUser: User | null }` and actions `setUser(user: User)`, `clearUser()`; export `useSessionStore` hook
- [ ] T024 Update `client/src/main.tsx` — wrap app with `QueryClientProvider` (new `QueryClient` with `staleTime: 30_000`), import and initialize socket singleton, keep `BrowserRouter`
- [ ] T025 Set up React Router in `client/src/App.tsx` — define routes: `"/"` → `<UserSelectPage>`, `"/feed"` → `<FeedPage>` (protected: redirects to `"/"` if `activeUser` is null in sessionStore); add lazy imports for both pages

**Checkpoint**: Server starts, Prisma connects, seed data loads, Socket.io room works, client builds without errors.

---

## Phase 3: User Story 1 — User Selection & Identity (Priority: P1) 🎯 MVP

**Goal**: Visitor selects one of five predefined users and enters the feed as that identity.

**Independent Test**: Launch app at `/` — see 5 user cards. Click one → land on `/feed` with that user's name shown. Refresh → back to `/` (session lost). Select again → feed works.

### Implementation

- [ ] T026 [P] [US1] Create `client/src/components/user/UserAvatar.tsx` — displays `<img src={avatarUrl} alt={name}>` with Tailwind circular crop; shows initials fallback on image error; accepts `user: User` prop
- [ ] T027 [P] [US1] Implement `server/src/routes/session.ts` — `POST /api/session` (validate userId exists, set `req.session.userId`, return user); `GET /api/session` (return req.user or 401); `DELETE /api/session` (destroy session, return ok); use `activeUser` middleware only on GET
- [ ] T028 [P] [US1] Implement `GET /api/users` in `server/src/routes/users.ts` — query all users via Prisma, return `{ data: users }`; no auth required
- [ ] T029 [US1] Register `session` and `users` routers in `server/src/app.ts` at `/api/session` and `/api/users`
- [ ] T030 [US1] Create `client/src/hooks/useSession.ts` — on mount calls `GET /api/session`; if active, calls `setUser`; exposes `selectUser(userId)` (calls `POST /api/session`, then `setUser`, then navigates to `/feed`); exposes `clearSession()` (calls `DELETE /api/session`, `clearUser`, navigates to `/`)
- [ ] T031 [US1] Create `client/src/components/user/UserSelectScreen.tsx` — fetches `GET /api/users` on mount, renders grid of 5 user cards (UserAvatar + name), calls `selectUser` from `useSession` on card click; shows loading spinner while fetching
- [ ] T032 [US1] Create `client/src/pages/UserSelectPage.tsx` — renders `<UserSelectScreen>`; if `activeUser` is already set in sessionStore, immediately redirects to `/feed`
- [ ] T033 [US1] Create `client/src/pages/FeedPage.tsx` (skeleton) — renders active user name/avatar in header; includes sign-out button calling `clearSession`; renders placeholder `<div>Feed coming in US2</div>`; redirects to `/` if no activeUser

**Checkpoint**: Select a user → land on feed page with name in header. Sign out → back to selection screen.

---

## Phase 4: User Story 2 — Feed Browsing (Priority: P1)

**Goal**: Reverse-chronological feed with infinite scroll and in-app refresh without session loss.

**Independent Test**: With seeded data visible, scroll to the bottom → older threads load. Click refresh button → feed reloads, selected user unchanged.

### Implementation

- [ ] T034 [US2] Implement `server/src/services/threadService.ts` — `getPaginatedFeed({ userId, cursor, limit })`: query threads with Prisma cursor pagination (orderBy: createdAt desc), include author, replies (with author), compute `likedByMe` (Like exists for userId + threadId) and `followingAuthor` (Follow exists for userId + thread.authorId); return `{ threads, nextCursor }`
- [ ] T035 [US2] Implement `GET /api/threads` in `server/src/routes/threads.ts` — parse `cursor` and `limit` query params, call `threadService.getPaginatedFeed`; session is optional (if no session, `likedByMe` and `followingAuthor` default to `false`); register router in `server/src/app.ts` at `/api/threads`
- [ ] T036 [P] [US2] Create `client/src/components/common/LoadingSpinner.tsx` — centered Tailwind spinner animation; accepts optional `fullPage` boolean prop for full-height centering
- [ ] T037 [P] [US2] Create `client/src/components/common/EmptyState.tsx` — displays icon + `message` prop text centered; used for empty feed
- [ ] T038 [US2] Create `client/src/hooks/useFeed.ts` — `useInfiniteQuery` against `GET /api/threads?cursor=&limit=20`; `getNextPageParam` reads `nextCursor`; exposes `threads` (flattened), `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`, `isFetching`, `refetch`
- [ ] T039 [P] [US2] Create `client/src/components/feed/InfiniteScrollTrigger.tsx` — renders an invisible `<div ref>` at the bottom of the list; uses `IntersectionObserver` to call `onIntersect` prop when visible; used by FeedList to trigger `fetchNextPage`
- [ ] T040 [US2] Create `client/src/components/thread/ThreadCard.tsx` — renders: author UserAvatar + name, relative timestamp, text content, image (if `imageUrl`), likeCount badge, replyCount badge; accepts `thread: Thread` prop; slots for action buttons (LikeButton, ReplyButton, DeleteButton — rendered as children or via props in later stories)
- [ ] T041 [US2] Create `client/src/components/feed/FeedList.tsx` — maps `threads` array to `<ThreadCard>` components; appends `<InfiniteScrollTrigger>` calling `fetchNextPage`; shows `<LoadingSpinner>` while `isFetchingNextPage`; shows `<EmptyState message="No threads yet">` when array is empty
- [ ] T042 [US2] Update `client/src/pages/FeedPage.tsx` — replace placeholder with `<FeedList>` using `useFeed`; add refresh button (top-right of header) calling `refetch()`; show `<LoadingSpinner fullPage>` on initial load

**Checkpoint**: Feed loads seeded threads newest-first. Scroll triggers next page. Refresh button reloads content without losing user identity.

---

## Phase 5: User Story 3 — Thread Creation (Priority: P2)

**Goal**: Active user composes and publishes a new thread (text ≤ 500 chars + optional image).

**Independent Test**: Compose a thread with text, submit → it appears at the top of the feed with correct author and timestamp. Submit empty → blocked with error. Attach second image → first is replaced.

### Implementation

- [ ] T043 [US3] Extend `server/src/services/threadService.ts` — add `createThread({ authorId, content, imageUrl? })`: validate content 1–500 chars (throw `400 CONTENT_TOO_LONG` / `400 EMPTY_THREAD`), insert Thread via Prisma, return full thread with author
- [ ] T044 [US3] Extend `server/src/routes/threads.ts` — add `POST /api/threads` with `activeUser` middleware and Multer `single("image")` middleware; call `threadService.createThread`; respond 201 with new thread
- [ ] T045 [P] [US3] Create `client/src/components/common/ImageUpload.tsx` — file `<input accept="image/*">`; on change, validates type (JPEG/PNG/GIF/WebP) client-side, stores file in local state, shows thumbnail preview; "remove" button clears file; exposes `file: File | null` and `clearFile()` via ref or callback prop
- [ ] T046 [US3] Create `client/src/components/thread/ThreadCompose.tsx` — `<textarea>` with live character counter (`{remaining}/500`, red when ≤ 20); `<ImageUpload>` slot (one image, second replaces first); submit button disabled when content empty AND no image, or content over 500; on submit, posts `FormData` to `POST /api/threads` via `api.post`; calls `onSuccess(newThread)` callback on 201
- [ ] T047 [US3] Wire ThreadCompose into `client/src/pages/FeedPage.tsx` — render compose area below header; on `onSuccess`, prepend new thread to TanStack Query cache (`queryClient.setQueryData`) and scroll feed to top

**Checkpoint**: Post a thread → appears immediately at top. Over-limit text → submit blocked. Image attaches and previews; second image replaces first.

---

## Phase 6: User Story 4 — Replies & Conversation Chains (Priority: P2)

**Goal**: Any user can reply to any thread; replies appear inline below with a visual connector.

**Independent Test**: Click Reply on a thread → compose area opens. Submit reply → appears below parent thread with left-border connector. Multiple replies stack chronologically.

### Implementation

- [ ] T048 [US4] Implement `server/src/services/replyService.ts` — `createReply({ authorId, threadId, content, io })`: validate content 1–500 chars, insert Reply, increment `Thread.replyCount` in same transaction, emit `reply:count-updated` via `io.to("global-feed")`; return reply with author
- [ ] T049 [US4] Implement `server/src/routes/replies.ts` — `POST /api/threads/:threadId/replies` with `activeUser` middleware, calls `replyService.createReply`; return 201; register at `/api` in `server/src/app.ts`
- [ ] T050 [P] [US4] Create `client/src/components/reply/ReplyCard.tsx` — renders reply: author UserAvatar + name, relative timestamp, content, likeCount badge; styled with `border-l-2 border-gray-300 pl-3 ml-4` (visual connector); slots for LikeButton and DeleteButton (wired in later stories)
- [ ] T051 [US4] Create `client/src/components/reply/ReplyList.tsx` — renders list of `<ReplyCard>` for a thread's `replies` array; empty renders nothing (thread with no replies shows no connector)
- [ ] T052 [US4] Create `client/src/components/reply/ReplyCompose.tsx` — compact single-line `<input>` with 500-char limit; submit button; on submit, posts `{ content }` to `POST /api/threads/:threadId/replies`; calls `onSuccess(newReply)` or `onCancel`
- [ ] T053 [US4] Update `client/src/components/thread/ThreadCard.tsx` — add Reply button toggling `<ReplyCompose>` visibility below thread; render `<ReplyList replies={thread.replies}>`; on ReplyCompose `onSuccess`, append new reply to thread's replies in TanStack Query cache and hide compose
- [ ] T054 [US4] Wire `reply:count-updated` in `client/src/services/socket.ts` — on event `{ threadId, replyCount }`, use `queryClient.setQueryData` to update the matching thread's `replyCount` across all feed pages

**Checkpoint**: Reply submitted → visible below parent with connector. replyCount on thread updates live in a second browser tab.

---

## Phase 7: User Story 5 — Likes & Social Signals (Priority: P2)

**Goal**: Like/unlike any thread or reply; counts update in real time across sessions.

**Independent Test**: Like a thread in tab 1 → like count increments. In tab 2 (different user), count updates within 3 seconds without refresh. Unlike → count decrements.

### Implementation

- [ ] T055 [US5] Implement `server/src/services/likeService.ts` — `likeTarget({ userId, targetType, targetId, io })`: within Prisma transaction, create Like record (throw `409 ALREADY_LIKED` if unique constraint violated), increment `likeCount` on Thread or Reply; emit `like:updated` to `"global-feed"`; return new `likeCount`. `unlikeTarget(...)`: delete Like (throw `404 NOT_LIKED` if absent), decrement count, emit event; return new count
- [ ] T056 [US5] Implement `server/src/routes/likes.ts` — `POST /api/threads/:id/likes`, `DELETE /api/threads/:id/likes`, `POST /api/replies/:id/likes`, `DELETE /api/replies/:id/likes`; all require `activeUser` middleware; register at `/api` in `server/src/app.ts`
- [ ] T057 [US5] Create `client/src/hooks/useLike.ts` — exposes `toggleLike({ targetType, targetId, likedByMe })`: calls correct `POST`/`DELETE` endpoint; performs optimistic cache update on matching thread/reply (`likeCount ±1`, `likedByMe` flip); rolls back on error
- [ ] T058 [P] [US5] Create `client/src/components/common/LikeButton.tsx` — heart icon button; shows `likeCount`; filled/outlined state from `likedByMe` prop; calls `onToggle` on click; accepts `likeCount: number`, `likedByMe: boolean`, `onToggle: () => void`, `disabled?: boolean`
- [ ] T059 [US5] Wire `<LikeButton>` into `client/src/components/thread/ThreadCard.tsx` — pass `thread.likeCount`, `thread.likedByMe`, and `useLike().toggleLike` for the thread
- [ ] T060 [US5] Wire `<LikeButton>` into `client/src/components/reply/ReplyCard.tsx` — pass `reply.likeCount`, `reply.likedByMe`, and `useLike().toggleLike` for the reply
- [ ] T061 [US5] Wire `like:updated` in `client/src/services/socket.ts` — on event `{ targetType, targetId, likeCount }`, update `likeCount` on matching thread or reply in all TanStack Query feed pages cache

**Checkpoint**: Like/unlike updates count immediately (optimistic). Second tab receives real-time update via socket. Self-like works.

---

## Phase 8: User Story 6 — Follow & Unfollow Users (Priority: P3)

**Goal**: Active user can follow or unfollow any other user from the feed.

**Independent Test**: As user A, click Follow on user B's thread → button shows "Following". Click again → reverts to "Follow". Follow state persists for the session.

### Implementation

- [ ] T062 [P] [US6] Implement `server/src/services/followService.ts` — `followUser({ followerId, followingId })`: enforce `followerId !== followingId` (throw `400 CANNOT_SELF_FOLLOW`), create Follow (throw `409 ALREADY_FOLLOWING` on duplicate); `unfollowUser(...)`: delete Follow (throw `404 NOT_FOLLOWING` if absent)
- [ ] T063 [US6] Extend `server/src/routes/users.ts` — add `POST /api/users/:id/follow` and `DELETE /api/users/:id/follow` with `activeUser` middleware; wire `followService`; add `GET /api/users/:id/follow-status` with `activeUser` middleware
- [ ] T064 [US6] Create `client/src/hooks/useFollow.ts` — `toggleFollow({ userId, isFollowing })`: calls `POST`/`DELETE /api/users/:id/follow`; performs optimistic cache update on all feed threads where `thread.author.id === userId` flipping `followingAuthor`; rolls back on error
- [ ] T065 [US6] Create `client/src/components/user/FollowButton.tsx` — shows "Follow" / "Following" text button; hidden when `userId === activeUser.id` (own profile); calls `onToggle` on click; accepts `userId: string`, `isFollowing: boolean`, `onToggle: () => void`
- [ ] T066 [US6] Wire `<FollowButton>` into `client/src/components/thread/ThreadCard.tsx` — render next to author name; pass `thread.author.id`, `thread.followingAuthor`, and `useFollow().toggleFollow`

**Checkpoint**: Follow button appears on other users' threads. Toggle updates state. Not shown on own threads.

---

## Phase 9: User Story 7 — Content Deletion (Priority: P3)

**Goal**: Active user can delete their own threads and replies; no delete control on others' content.

**Independent Test**: As user A, delete own thread → disappears from feed, replies gone. Inspect user B's thread → no delete option visible. In second tab, deleted thread disappears via socket event.

### Implementation

- [ ] T067 [P] [US7] Extend `server/src/services/threadService.ts` — add `deleteThread({ userId, threadId })`: fetch thread, verify `thread.authorId === userId` (throw `403 NOT_OWNER` if not), delete thread (Prisma cascade removes replies/likes), emit `thread:deleted` to `"global-feed"` via io
- [ ] T068 [P] [US7] Extend `server/src/services/replyService.ts` — add `deleteReply({ userId, replyId })`: fetch reply, verify `reply.authorId === userId` (throw `403 NOT_OWNER`), delete reply, decrement parent `Thread.replyCount` in transaction, emit `reply:deleted` to `"global-feed"` via io
- [ ] T069 [US7] Extend `server/src/routes/threads.ts` — add `DELETE /api/threads/:id` with `activeUser` middleware; call `threadService.deleteThread`; respond 200 ok
- [ ] T070 [US7] Extend `server/src/routes/replies.ts` — add `DELETE /api/replies/:id` with `activeUser` middleware; call `replyService.deleteReply`; respond 200 ok
- [ ] T071 [P] [US7] Create `client/src/components/common/DeleteButton.tsx` — trash icon button; on click, shows inline confirmation ("Delete?" + Confirm/Cancel); on confirm, calls `onDelete()` async prop; hidden when `isOwner` prop is false; shows loading state during deletion
- [ ] T072 [US7] Wire `<DeleteButton>` into `client/src/components/thread/ThreadCard.tsx` — `isOwner={thread.author.id === activeUser?.id}`; `onDelete`: calls `DELETE /api/threads/:id`, then removes thread from all TanStack Query feed page caches
- [ ] T073 [US7] Wire `<DeleteButton>` into `client/src/components/reply/ReplyCard.tsx` — `isOwner={reply.author.id === activeUser?.id}`; `onDelete`: calls `DELETE /api/replies/:id`, then removes reply from parent thread's replies in cache
- [ ] T074 [US7] Wire `thread:deleted` in `client/src/services/socket.ts` — on event `{ threadId }`, remove matching thread from all TanStack Query feed pages in cache
- [ ] T075 [US7] Wire `reply:deleted` in `client/src/services/socket.ts` — on event `{ replyId, threadId }`, remove matching reply from the parent thread's replies array in cache

**Checkpoint**: Delete own thread → gone from feed + replies gone. Delete own reply → gone, parent replyCount decrements. No delete option on others' content. Second tab reflects deletions in real time.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements across all user stories.

- [ ] T076 [P] Add loading skeleton cards in `client/src/components/feed/FeedList.tsx` — show 3 placeholder skeleton `<div>` blocks (Tailwind `animate-pulse`) during initial `isFetching && !threads.length` state instead of blank screen
- [ ] T077 [P] Implement mobile-responsive layout — audit ThreadCard, ReplyCard, UserSelectScreen, FeedPage with Tailwind `sm:` / `md:` breakpoints; ensure compose area and buttons are touch-friendly (min 44px tap targets)
- [ ] T078 [P] Add React error boundary `client/src/components/common/ErrorBoundary.tsx` — catches uncaught render errors; shows friendly "Something went wrong" fallback; wrap `<App>` in `client/src/main.tsx`
- [ ] T079 [P] Ensure `likedByMe` initial state from `GET /api/threads` is correctly reflected in `<LikeButton>` and `followingAuthor` in `<FollowButton>` on first load (no hydration mismatch between server state and optimistic cache)
- [ ] T080 [P] Add `client/.gitignore` excluding `node_modules/`, `dist/`, `.env`; verify `server/.gitignore` excludes `node_modules/`, `dist/`, `.env`, `uploads/*`
- [ ] T081 Run quickstart.md validation — follow every step in `specs/001-threads-platform/quickstart.md` end-to-end; verify all 7 user story acceptance flows pass; document any deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3–9 (User Stories)**: All depend on Phase 2 — can proceed in priority order
- **Phase 10 (Polish)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — first to implement after Foundational
- **US2 (P1)**: Depends on US1 (session required to identify active user in feed)
- **US3 (P2)**: Depends on US2 (posts into the feed)
- **US4 (P2)**: Depends on US2 (replies render inside ThreadCard)
- **US5 (P2)**: Depends on US2 (LikeButton lives on ThreadCard/ReplyCard); US4 needed for reply likes
- **US6 (P3)**: Depends on US2 (FollowButton on ThreadCard)
- **US7 (P3)**: Depends on US2, US4 (DeleteButton on ThreadCard/ReplyCard)

### Within Each User Story

- Server routes → before client hooks → before components → before wiring
- Socket event wiring can happen in parallel with component work

### Parallel Opportunities

- All `[P]`-marked tasks within a phase can run in parallel
- T002 (server init) and T003 (client init) can run in parallel
- T013–T016 (Prisma) and T017–T022 (Express/Socket setup) can partially overlap

---

## Parallel Example: Phase 2 Foundational

```bash
# Run in parallel:
Task T013: Write Prisma schema
Task T017: Implement errorHandler.ts
Task T019: Create socket/handlers.ts

# After T013 completes:
Task T014: Run migration
# After T014 completes:
Task T015: Write seed.ts
Task T016: Run seed

# After T017+T019 complete:
Task T020: Create app.ts (wires all middleware)
Task T021: Create api.ts (client)
Task T022: Create socket.ts (client)
Task T023: Create sessionStore.ts (client)
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — foundation ready
3. Complete Phase 3: US1 — identity selection works
4. Complete Phase 4: US2 — feed browsing works
5. **STOP and VALIDATE**: 5 users selectable, feed loads seeded data, infinite scroll works, refresh preserves session
6. Demo as MVP

### Incremental Delivery

1. Setup + Foundational → skeleton running
2. US1 → identity selection
3. US2 → browsable feed ← **MVP demo point**
4. US3 → create threads
5. US4 → reply chains
6. US5 → live like counts ← **fully interactive**
7. US6 → social graph
8. US7 → content control
9. Polish → production-ready feel

---

## Notes

- `[P]` = different files, no pending dependencies in same phase
- `[USn]` = maps task to user story for traceability
- Socket.io `io` instance must be passed into service functions (not imported directly) to maintain testability
- TanStack Query cache updates (optimistic + socket-driven) are the primary real-time UX mechanism on the client
- All server mutations go through a service layer; routes are thin wrappers only (constitution III)
- Seed data is the only content on first launch (US1 spec clarification Q3)
