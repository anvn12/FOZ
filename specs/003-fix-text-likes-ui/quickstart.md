# Quickstart: Fix Text Overflow, Per-User Likes, Like Count

**Prerequisites**: MVP running ([001 quickstart](../001-threads-platform/quickstart.md)).

---

## 1. Start stack

```bash
cd server && npm run dev
cd client && npm run dev
```

---

## 2. Per-user likes (US1) — SC-001, SC-003

1. Sign in as **Carlos**.
2. Like the **first 3 threads** in the feed.
3. **Sign out** (do not hard-refresh browser).
4. Sign in as a **different** user (e.g. Maria).
5. **Expect**: Those 3 threads show **empty** heart (not liked) for Maria.
6. Sign out → sign in as Carlos again.
7. **Expect**: Carlos still sees his 3 likes.

Repeat with a third account if needed (SC-001: 5-account spot check).

---

## 3. Like count (US2) — SC-002

As one user on a thread with count **N** (not liked by you):

1. Like → display **N+1**, filled heart.
2. Unlike → display **N**, outline heart.
3. **Refresh** → same N and outline heart.

Test **5 threads + 3 replies** in one session.

---

## 4. Long text (US3) — SC-004

1. Post or find a thread near **500 characters**.
2. Post or find content with a **long URL** (no spaces).
3. **Expect**: Full text visible, wrapped inside card; no horizontal scroll on message.

Check a **long reply** under a thread too.

---

## 5. Regression

- Post new thread → no error screen (002 fix).
- Like 10+ items in a row → no freeze (002 fix).

---

## Success criteria map

| ID | Step |
|---|---|
| SC-001 | §2 five accounts |
| SC-002 | §3 ten toggles |
| SC-003 | §2 no refresh on switch |
| SC-004 | §4 long content |
| SC-005 | §3 reload check |
