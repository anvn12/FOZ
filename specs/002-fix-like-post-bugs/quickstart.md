# Quickstart: Fix Like & Post Bugs — Verification

**Prerequisites**: MVP running per [001 quickstart](../001-threads-platform/quickstart.md)
(server + client + seeded DB).

---

## 1. Start stack

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`, pick any seeded user.

---

## 2. Post thread — no error screen (US2)

1. Compose text thread → **Post**.
2. **Expect**: New thread at top of feed; **no** “Something went wrong” screen.
3. Repeat with image attachment.
4. Sign out → pick another user → post again.

**Fail signals**: Black/full-screen error; must refresh to see post.

---

## 3. Like reliability (US1)

On feed with multiple threads and visible replies:

1. Like **10 different threads** in a row (wait for each to finish or verify
   parallel UX if per-target pending implemented).
2. Unlike 3 of them.
3. Like **5 replies** on different threads.
4. Reload page.

**Expect**:

- Every click updates heart + count.
- After reload, liked items show filled heart.
- No full-screen error.

**Fail signals**: Button stops responding after 1–2 likes; count wrong; all
buttons frozen.

---

## 4. Edge cases

| Action | Expect |
|---|---|
| Double-click like quickly | Single like; no stuck state |
| Like while another like in flight (different thread) | Second thread like works (per-target pending) |
| Post empty (no text/image) | Inline validation error, no crash |

---

## 5. Multi-account spot check (SC-005)

Repeat steps 2–3 for at least 2 of the 5 seeded users.

---

## 6. Success criteria mapping

| Criterion | Verified by |
|---|---|
| SC-001 (20+ likes) | Step 3 extended to 20 threads + 20 replies |
| SC-002 (&lt; 500 ms feedback) | Subjective on like click |
| SC-003–SC-004 (post without error) | Step 2 |
| SC-005 (all accounts) | Step 5 with 5 users optional |
