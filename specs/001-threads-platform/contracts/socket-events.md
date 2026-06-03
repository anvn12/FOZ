# Socket.io Event Contract: Threads Platform — Core MVP

**Transport**: WebSocket (with HTTP long-polling fallback)
**Server namespace**: `/` (default)
**Global room**: `global-feed` — all connected clients join on connection.

---

## Connection

Client connects to the server's Socket.io endpoint and immediately joins the
`global-feed` room. No authentication handshake required (prototype).

```ts
// Client-side
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
socket.emit("join-feed");
```

```ts
// Server-side (handlers.ts)
socket.on("join-feed", () => {
  socket.join("global-feed");
});
```

---

## Server → Client Events

These events are broadcast to all clients in `global-feed` after a mutating
REST operation completes successfully.

### `like:updated`

Emitted after any like or unlike action on a thread or reply.

**Payload**:
```ts
{
  targetType: "thread" | "reply";
  targetId: string;          // Thread.id or Reply.id
  likeCount: number;         // New total like count
}
```

**Client behavior**: Update the cached like count for the matching item in
TanStack Query cache. Toggle `likedByMe` state for the active user.

---

### `reply:count-updated`

Emitted after a reply is created or deleted.

**Payload**:
```ts
{
  threadId: string;
  replyCount: number;   // New total reply count for that thread
}
```

**Client behavior**: Update the `replyCount` on the matching thread in the
TanStack Query cache.

---

### `thread:deleted`

Emitted after a thread is deleted (via `DELETE /threads/:id`).

**Payload**:
```ts
{
  threadId: string;
}
```

**Client behavior**: Remove the thread (and its inline replies) from the feed
cache. If the deleted thread is currently in view, display a "This thread has
been removed" placeholder or remove it from the list.

---

### `reply:deleted`

Emitted after a reply is deleted (via `DELETE /replies/:id`).

**Payload**:
```ts
{
  replyId: string;
  threadId: string;   // Parent thread, for cache targeting
}
```

**Client behavior**: Remove the reply from the parent thread's reply list in
the TanStack Query cache.

---

## Client → Server Events

### `join-feed`

Sent once on connection to join the `global-feed` broadcast room.

**Payload**: none

---

## Event Emission Flow (Server)

All Socket.io emissions happen inside the service layer AFTER the database
transaction commits successfully. The pattern:

```ts
// Example: likeService.ts
async function likeThread(userId: string, threadId: string, io: Server) {
  // 1. DB write (create Like, increment likeCount)
  const { likeCount } = await prisma.$transaction(async (tx) => { ... });

  // 2. Broadcast to all connected clients
  io.to("global-feed").emit("like:updated", {
    targetType: "thread",
    targetId: threadId,
    likeCount,
  });

  return likeCount;
}
```

The `io` (Socket.io Server instance) is passed into service functions from
the route handler, keeping services aware of the real-time layer without
coupling to Express request/response objects.

---

## Out of Scope (This Phase)

- New thread auto-push to feed (spec Q4: counts only are real-time)
- User presence indicators
- Typing indicators
- Notification events
