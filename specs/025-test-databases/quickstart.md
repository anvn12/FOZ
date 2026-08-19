# Quickstart Guide: Test Databases & Fixture Datasets

**Feature Branch**: `025-test-databases`
**Spec**: [spec.md](./spec.md)

This guide explains how to provision, reset, and use the two isolated test databases (`foz_test_empty` and `foz_test_populated`).

---

## 1. Prerequisites

Ensure your PostgreSQL Docker container is running:
```bash
npm run dev:db
```

---

## 2. One-Time Setup (Both Test Databases)

To create both databases, run all migrations, and seed baseline fixtures:
```bash
npm run db:test:setup
```

---

## 3. Resetting Individual Test Databases

### Reset Empty State Database (`foz_test_empty`)
Clears all user data, runs pending migrations, and inserts Admin + Moderator (0 posts):
```bash
npm run db:test:empty:reset
```

### Reset Populated Database (`foz_test_populated`)
Clears all user data, runs pending migrations, and seeds 50 users, 100 posts, and rich interactions:
```bash
npm run db:test:populated:reset
```

---

## 4. Account Credentials Cheat Sheet

### Administrative Accounts (Available in BOTH databases)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@admin.foz` | `admin@admin.foz` |
| **Moderator** | `mod@mod.foz` | `mod@mod.foz` |

### Standard Test Users (Available in `foz_test_populated`)

| User | Email | Password |
|---|---|---|
| User 1 | `user1@foz.test` | `password123` |
| User 2 | `user2@foz.test` | `password123` |
| ... | ... | `password123` |
| User 50 | `user50@foz.test` | `password123` |

---

## 5. Using Test Databases in Vitest

In your test file or setup hook, point `DATABASE_URL` to either test database:

```typescript
// For Empty State Tests:
process.env.DATABASE_URL = "postgres://foz:foz@localhost:5432/foz_test_empty";

// For Populated State Tests:
process.env.DATABASE_URL = "postgres://foz:foz@localhost:5432/foz_test_populated";
```
