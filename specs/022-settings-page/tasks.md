# Tasks: Settings Page

**Input**: Design documents from `/specs/022-settings-page/`

**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: Not requested in spec — omitted.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: No setup needed — all dependencies already exist (react-hook-form, zod, Tailwind, zustand).

_Skipped — nothing to initialize._

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme initialization on page load (blocks US3, but harmless to add early)

- [ ] T001 Add inline theme-init script in `src/frontend/index.html` that reads `localStorage.getItem("foz-theme")` and applies `dark` class to `<html>` before React renders, falling back to `prefers-color-scheme`

**Checkpoint**: Theme flash prevention in place — user stories can begin.

---

## Phase 3: User Story 1 — Access Settings from More Menu (Priority: P1) 🎯 MVP

**Goal**: Replace "Settings coming soon" toast with navigation to a Settings page showing Change Password and Appearance sections.

**Independent Test**: Click More → Settings → Settings page loads with two sections visible.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Create `SettingsPage.tsx` skeleton in `src/frontend/src/pages/SettingsPage.tsx` with two section headings ("Change Password" and "Appearance") and placeholder content
- [ ] T003 [US1] Update NavBar desktop menu in `src/frontend/src/components/NavBar.tsx` — replace `toast("Settings coming soon")` with `navigate("/settings")` using `useNavigate()`
- [ ] T004 [US1] Update NavBar mobile menu in `src/frontend/src/components/NavBar.tsx` — same toast → navigate replacement for the mobile drawer
- [ ] T005 [US1] Add route `<Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />` in `src/frontend/src/App.tsx`

**Checkpoint**: Clicking Settings in More menu navigates to the Settings page. Page shows two sections.

---

## Phase 4: User Story 2 — Change Password (Priority: P2)

**Goal**: Embed a working change-password form in the Settings page that reuses the existing API endpoint.

**Independent Test**: Navigate to Settings → fill in current + new password → submit → password is changed.

### Implementation for User Story 2

- [ ] T006 [US2] Extract password form logic from `src/frontend/src/pages/ChangePasswordPage.tsx` into a reusable `ChangePasswordForm` component in `src/frontend/src/components/ChangePasswordForm.tsx` — move the react-hook-form setup, fields, and submit handler; keep ChangePasswordPage as a thin wrapper that renders it inside AuthShell
- [ ] T007 [US2] Embed `<ChangePasswordForm />` into the "Change Password" section of `src/frontend/src/pages/SettingsPage.tsx`

**Checkpoint**: Settings page shows a working password change form. Submitting it calls the existing API and shows toast feedback.

---

## Phase 5: User Story 3 — Toggle Appearance (Priority: P3)

**Goal**: Add a dark/light mode toggle in the Appearance section that persists across sessions.

**Independent Test**: Toggle to dark mode → UI changes immediately → reload → still dark mode.

### Implementation for User Story 3

- [ ] T008 [P] [US3] Create `AppearanceToggle.tsx` in `src/frontend/src/components/AppearanceToggle.tsx` — reads `localStorage.getItem("foz-theme")`, renders Light/Dark/System segmented control, on change sets localStorage and toggles `dark` class on `document.documentElement`
- [ ] T009 [US3] Embed `<AppearanceToggle />` into the "Appearance" section of `src/frontend/src/pages/SettingsPage.tsx`

**Checkpoint**: Appearance toggle works. Theme persists on reload. All three user stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup

- [ ] T010 Verify `ChangePasswordPage.tsx` still works standalone at `/change-password` after the extraction in T006
- [ ] T011 Ensure Settings page is not visible to guests (NavBar hides Settings option for unauthenticated users; route uses RequireAuth guard)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: No dependencies — do first
- **Phase 3 (US1)**: Depends on Phase 2 (T001)
- **Phase 4 (US2)**: Depends on US1 (T002 skeleton exists)
- **Phase 5 (US3)**: Depends on US1 (T002 skeleton exists); T008 can parallel with Phase 4
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — start after Phase 2
- **US2 (P2)**: Needs SettingsPage skeleton from US1
- **US3 (P3)**: Needs SettingsPage skeleton from US1; independent of US2

### Parallel Opportunities

- T002 and T001 can run in parallel (different files)
- T006 and T008 can run in parallel (different files, different stories)
- T008 and T007 can run in parallel after T006 completes

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T001 (theme init script)
2. Complete Phase 3: T002–T005 (Settings page + NavBar + route)
3. **STOP and VALIDATE**: Click More → Settings → page loads
4. Ship MVP — Settings page exists, Change Password and Appearance sections show placeholders

### Incremental Delivery

1. T001–T005 → Settings page accessible from More menu (MVP)
2. T006–T007 → Change Password form works
3. T008–T009 → Appearance toggle works
4. T010–T011 → Polish and verify

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Backend is untouched — `PATCH /api/v1/auth/password` already exists
- `ChangePasswordPage.tsx` at `/change-password` remains functional after extraction
