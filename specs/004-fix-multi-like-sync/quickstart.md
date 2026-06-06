# Quickstart: Fix Multi-Like Persistence

**Prerequisites**: MVP stack running; apply migration from this feature first.

---

## 1. Migrate database

```bash
cd server
npx prisma migrate dev
```

Confirm migration applies filtered unique indexes on `Like`.

---

## 2. Start app

```bash
cd server && npm run dev
cd client && npm run dev
```

---

## 3. Multi-like persistence (SC-001, SC-003)

1. Sign in as any user.
2. Like **5 different threads** in the feed.
3. Expand replies; like **3 replies** on different threads.
4. **Do not refresh** — all 8 show filled heart and stable counts.
5. Click **Refresh** — all 8 still liked.
6. Sign out → sign in same user — all 8 still liked.

---

## 4. Count stability (SC-002)

For each of 5 unliked threads (note count N):

1. Like → shows N+1 immediately.
2. Wait 5 seconds — still N+1, heart filled.
3. Unlike → N, heart empty.

No instant drop after like.

---

## 5. Unlike isolation (SC-004)

Like threads A, B, C. Unlike B only.

- A, C still liked.
- B not liked.

---

## 6. Regression

- Per-user like isolation (003): switch user — no carryover.
- Post thread (002): no error screen.

---

## 7. DB spot check (optional)

```sql
SELECT userId, threadId, replyId FROM Like WHERE userId = '<test-user-id>';
```

Expect one row per liked thread/reply (8 rows after step 3).
