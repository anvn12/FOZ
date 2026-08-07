# Implementation Plan: Settings Page

**Branch**: `022-settings-page` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-settings-page/spec.md`

## Summary

Add a Settings page accessible from the "More" menu containing two sections: Change Password (reuses existing `PATCH /api/v1/auth/password` endpoint and form) and Appearance toggle (dark/light mode with localStorage persistence and `prefers-color-scheme` fallback).

## Technical Context

**Language/Version**: TypeScript 5.x, ESM
**Primary Dependencies**: React 18, react-hook-form, zod, Tailwind CSS 4, zustand
**Storage**: PostgreSQL 16 (user table already exists); localStorage for appearance preference
**Testing**: Vitest
**Target Platform**: Web (Vite + React SPA)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Theme switch < 100ms, page load < 2s
**Constraints**: Must reuse existing `PATCH /api/v1/auth/password` backend endpoint (already implemented)
**Scale/Scope**: Single new page, 2 sections, ~4 files touched

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular Client-Server Architecture | ✅ | No changes to backend API; frontend-only feature |
| II. Enforced Folder Structure | ✅ | New page in `src/frontend/src/pages/`, components in `src/frontend/src/components/` |
| III. Clean Code & Reusability | ✅ | Reuses existing `ChangePasswordPage` form logic; no duplication |
| IV. Security at Every Layer | ✅ | Password change requires auth (existing middleware); no new security surface |
| V. Consistency Over Cleverness | ✅ | Uses existing patterns: react-hook-form + zod, zustand store, Tailwind utilities |
| VI. AI Service Boundaries | ✅ | N/A — no AI features involved |
| VII. Accessibility | ✅ | Form labels, keyboard navigation, color contrast via design system tokens |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/022-settings-page/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── checklists/
│   └── requirements.md  ← quality checklist
├── research.md          ← Phase 0 (not needed — no unknowns)
├── data-model.md        ← Phase 1 (not needed — no new entities)
└── quickstart.md        ← Phase 1 (not needed — no new dev setup)
```

### Source Code (repository root)

```text
src/frontend/src/
├── pages/
│   ├── SettingsPage.tsx          ← NEW: settings page with 2 sections
│   └── ChangePasswordPage.tsx    ← EXISTING: will be embedded/linked from Settings
├── components/
│   ├── NavBar.tsx                ← MODIFY: replace toast with navigate("/settings")
│   └── AppearanceToggle.tsx     ← NEW: dark/light toggle component
├── stores/
│   └── auth.ts                   ← EXISTING: no changes needed
└── index.css                     ← EXISTING: dark mode variables already added

src/backend/
└── (no changes — PATCH /api/v1/auth/password already exists)
```

**Structure Decision**: Frontend-only feature. No backend changes needed — the password endpoint already exists and appearance preference is stored client-side.

## Complexity Tracking

No violations. No complexity additions.

---

## Phase 0: Research

No unknowns to resolve. All technical decisions are straightforward:

- **Password change**: Reuse existing `PATCH /api/v1/auth/password` endpoint and `useChangePassword()` hook
- **Appearance persistence**: localStorage with `prefers-color-scheme` fallback (standard pattern)
- **Theme application**: Toggle `dark` class on `<html>` element; Tailwind `darkMode: "media"` already configured

`research.md` not needed — no ambiguous decisions.

## Phase 1: Design & Contracts

### Data Model

No new database entities. Appearance preference is stored in localStorage only (per-user persistence via device storage; cross-device sync is out of scope).

`data-model.md` not needed — no schema changes.

### Contracts

No new API endpoints. The existing `PATCH /api/v1/auth/password` contract is reused as-is.

`contracts/` not needed — no new interfaces.

### Quickstart

No new developer setup required.

`quickstart.md` not needed — no new dev environment steps.

## Implementation Approach

### 1. Create `AppearanceToggle.tsx` component

- Reads initial theme from localStorage key `"foz-theme"`, falling back to `prefers-color-scheme`
- Renders a toggle switch or segmented control (Light / Dark / System)
- On change: sets localStorage, toggles `dark` class on `document.documentElement`
- Uses existing dark mode CSS variables already in `index.css`

### 2. Create `SettingsPage.tsx`

- Two sections: "Change Password" and "Appearance"
- Change Password section: embeds the existing form logic from `ChangePasswordPage.tsx` (extract shared form or inline)
- Appearance section: renders `AppearanceToggle`
- Protected by auth (redirect guests)

### 3. Update `NavBar.tsx`

- Replace `toast("Settings coming soon")` with `navigate("/settings")` (both desktop and mobile menus)
- Use `useNavigate()` from react-router-dom

### 4. Add route in `App.tsx`

- `<Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />`

### 5. Apply theme on page load

- Add a small inline `<script>` in `index.html` or a useEffect in App that reads localStorage and sets the `dark` class before React renders (prevents flash of wrong theme)
