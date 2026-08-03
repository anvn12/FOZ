# Quickstart Guide: Administrator Dashboard

**Feature**: `012-admin-dashboard`  
**Date**: 2026-08-02  

## 1. Database Migrations Setup

Ensure PostgreSQL container is running via Docker Compose:

```bash
docker-compose up -d postgres
```

Generate and apply Drizzle schema migrations for admin tables:

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

## 2. Seed Administrator Account (Development)

Ensure at least one user account exists with `role = 'administrator'` in PostgreSQL:

```sql
UPDATE users SET role = 'administrator' WHERE email = 'admin@foz.local';
```

## 3. Running Backend & Frontend

Start backend development server (Express API on port 5000):

```bash
npm --prefix src/backend run dev
```

Start frontend Vite dev server (on port 5173):

```bash
npm --prefix src/frontend run dev
```

## 4. Admin Routing Verification

Navigate to `http://localhost:5173/admin`:
- Log in with `admin@foz.local` credentials.
- Verify navigation to Admin Control Center (`/admin`), User Management (`/admin/users`), Audit Logs (`/admin/audit-logs`), Forum Categories (`/admin/categories`), and System Settings (`/admin/settings`).
- Attempt accessing `/admin` as a Standard User to confirm HTTP 403 Forbidden redirection.

## 5. Automated Vitest Tests

Run unit and integration test suites:

```bash
npm run test:backend -- src/backend/api/admin
npm run test:frontend -- src/frontend/src/pages/admin
```
