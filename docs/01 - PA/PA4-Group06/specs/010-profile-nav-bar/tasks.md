# Tasks: Profile Page Navigation Bar

**Input**: Design documents from `specs/010-profile-nav-bar/`

**Prerequisites**: [spec.md](./spec.md) ✅ | [plan.md](./plan.md) ✅ | [research.md](./research.md) ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared `NavBar` component file and move all co-located helpers into it. This is the single prerequisite for all user story phases.

- [x] T001 Create `src/frontend/src/components/NavBar.tsx` — empty file with placeholder export (establishes the module so Phase 2+ can import it)
- [x] T002 Move `ProfileNavBarAvatar` helper component from `src/frontend/src/pages/HomePage.tsx` into `src/frontend/src/components/NavBar.tsx` as an unexported internal helper

**Checkpoint**: `NavBar.tsx` exists and exports a stub; `ProfileNavBarAvatar` lives only in `NavBar.tsx`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the full `NavBar` component with route-aware active icon logic and self-contained state — the shared building block that both US1 and US2 depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Implement `NavBar` component body in `src/frontend/src/components/NavBar.tsx`:
  - Internal state: `isMoreMenuOpen`, `isMobileDrawerOpen`, `isLogoutOpen`
  - Hooks: `useAuthStore`, `useNavigate`, `useLocation` (from `react-router-dom`), `useProfile`
  - Active icon detection logic: `/` → Home active; `/profiles/*` → Profile active; otherwise none
  - Full desktop sidebar `<nav>` JSX (FOZ logo, Home, Search, Create, Profile, More hamburger menu) — extracted verbatim from `src/frontend/src/pages/HomePage.tsx`
  - Full mobile top `<header>` JSX — extracted verbatim from `src/frontend/src/pages/HomePage.tsx`
  - Full mobile navigation drawer JSX — extracted verbatim from `src/frontend/src/pages/HomePage.tsx`
  - Full mobile bottom `<nav>` JSX — extracted verbatim from `src/frontend/src/pages/HomePage.tsx`
  - `LogoutDialog` rendered inside `NavBar` (import from `#frontend/components/LogoutDialog`)
  - Apply active/inactive styles to Home icon and Profile icon based on active state
- [x] T004 Add all necessary imports to `src/frontend/src/components/NavBar.tsx`: `React`, `Link`, `useNavigate`, `useLocation` from `react-router-dom`; `useAuthStore` from `#frontend/stores/auth`; `useProfile` from `#frontend/api/profile`; `LogoutDialog` from `#frontend/components/LogoutDialog`; `toast` from `react-hot-toast`

**Checkpoint**: `NavBar` component is complete and self-contained. It can be imported and rendered anywhere.

---

## Phase 3: User Story 1 — Navigate from Profile Page to Home (Priority: P1) 🎯 MVP

**Goal**: The profile page renders the full nav bar and the "Back to Home" button is removed, restoring navigation to the home feed.

**Independent Test**: Visit `/profiles/:userId` → nav bar is visible with FOZ logo, all icons present; "Back to Home" link is absent; clicking the Home icon navigates to `/`.

### Implementation

- [x] T005 [US1] Update `src/frontend/src/pages/ProfilePage.tsx`:
  - Add import: `import { NavBar } from "#frontend/components/NavBar"`
  - Remove the `Link` import if no longer used elsewhere in the file (the "Back to Home" link was its only usage)
  - Remove the "Back to Home" `<div>` block (the `mb-6` div containing the `<Link to="/">` arrow link)
  - Wrap the existing return JSX in the same outer layout used by `HomePage`: `<div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">` with inner `<div className="w-full max-w-7xl flex relative justify-center">`
  - Add `<NavBar />` as the first child inside the inner container (before the content div)
  - Wrap profile content in a content div: `<div className="flex-1 w-full flex justify-center md:pl-24">` containing a `<main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen px-4 py-8">`
  - Move the existing profile content (`mx-auto max-w-2xl px-4 py-8` div) inside the new `<main>` — remove the outer `mx-auto max-w-2xl px-4 py-8` wrapper (the padding is now on `<main>`)

**Checkpoint**: US1 complete. Profile page shows nav bar; "Back to Home" is gone; clicking Home navigates to `/`.

---

## Phase 4: User Story 2 — Use All Nav Bar Actions from Profile Page (Priority: P2)

**Goal**: All nav bar actions (Search, Create, Profile, More menu, Logout) work correctly from the profile page, and the Profile icon is highlighted as active.

**Independent Test**: On the profile page — each nav icon interaction works; Profile icon has active styling; More menu opens; Logout dialog opens; unauthenticated users are redirected to `/login` for protected actions.

### Implementation

- [x] T006 [US2] Update `src/frontend/src/pages/HomePage.tsx` — remove the nav bar code that has been moved to `NavBar.tsx`:
  - Remove `ProfileNavBarAvatar` function definition (moved to `NavBar.tsx`)
  - Remove the desktop sidebar `<nav>` JSX block
  - Remove the mobile top `<header>` JSX block
  - Remove the mobile drawer JSX block
  - Remove the mobile bottom `<nav>` JSX block
  - Remove `LogoutDialog` render (moved into `NavBar`)
  - Remove state variables no longer used in `HomePage`: `isMoreMenuOpen`, `isMobileDrawerOpen`, `isLogoutOpen`
  - Remove `handleProtectedClick` if it is no longer used in `HomePage`'s own JSX (it moved to `NavBar`)
  - Add import: `import { NavBar } from "#frontend/components/NavBar"`
  - Render `<NavBar />` at the top of the returned JSX (in place of where the inline nav bar used to be), inside the existing outer layout container
  - Keep `handleCreateClick` (it is a feed-page concern, passed or referenced by the Create button — confirm and adjust if Create button is inside NavBar; if so, move the toast handler into NavBar)

**Checkpoint**: US2 complete. `HomePage` uses the shared `NavBar`; all nav actions work on both pages; Profile icon is highlighted on profile pages; no code duplication.

---

## Phase 5: User Story 3 — Profile Page Content Remains Unchanged (Priority: P3)

**Goal**: Verify all existing profile page content (header, bio, avatar, tabs, Edit Profile modal) is unaffected by the layout changes.

**Independent Test**: Visit own profile page — Edit Profile button visible, modal opens. Visit another user's profile — Edit Profile hidden. All tabs (Threads, Replies, Reposts) switch correctly.

### Implementation

- [x] T007 [US3] Review `src/frontend/src/pages/ProfilePage.tsx` after T005:
  - Confirm `isOwner`, `isEditModalOpen`, tab state, bio expand/collapse state are all still present and functional
  - Confirm `ProfileEditModal` is still rendered with correct props when `isOwner` is true
  - Confirm profile header (display name, handle, bio, location, website, avatar) renders inside the new `<main>` wrapper without visual breakage
  - If the `mx-auto` centering was removed from the old wrapper, confirm `max-w-2xl` is still on `<main>` or re-add it so profile content stays centered
- [x] T008 [P] [US3] Manually verify on `http://localhost:5173/profiles/:userId` (or via `npm run dev`):
  - Loading state spinner renders correctly
  - Error state ("Profile Not Found") renders correctly
  - Bio expand/collapse ("view more" / "show less") works
  - Website external link opens in new tab
  - Edit Profile button visible for owner only; modal opens and closes correctly
  - Threads / Replies / Reposts tab switching works

**Checkpoint**: US3 complete. All three user stories verified end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, consistency check, and test updates.

- [x] T009 Update `src/frontend/src/pages/__tests__/ProfilePage.test.tsx`:
  - Remove any assertions that check for the "Back to Home" link
  - Add assertion: nav bar landmark / `NavBar` component is rendered (e.g., FOZ logo text or `nav` element present)
  - Ensure existing assertions for profile content still pass
- [x] T010 [P] Update `src/frontend/src/pages/__tests__/HomePage.test.tsx` (if it exists and tests nav bar elements):
  - Ensure tests still pass after nav bar was extracted — the nav bar elements are now inside `NavBar`, so they may need to be tested via `NavBar.test.tsx` instead
- [x] T011 [P] Verify TypeScript compiles with zero errors: `npx tsc --noEmit` in `src/frontend/`
- [x] T012 [P] Run ESLint on changed files: `npx eslint src/frontend/src/components/NavBar.tsx src/frontend/src/pages/ProfilePage.tsx src/frontend/src/pages/HomePage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)         → no dependencies; start immediately
Phase 2 (Foundational)  → depends on Phase 1 (T001, T002 complete)
Phase 3 (US1 — P1)      → depends on Phase 2 (NavBar component complete)
Phase 4 (US2 — P2)      → depends on Phase 2; can run in parallel with Phase 3
Phase 5 (US3 — P3)      → depends on Phase 3 and Phase 4 both complete
Phase 6 (Polish)        → depends on Phase 5
```

### Task Dependencies (detailed)

| Task | Depends On | Can Parallelize With |
|------|-----------|----------------------|
| T001 | — | T002 (different concern, same file) |
| T002 | T001 | — |
| T003 | T001, T002 | — |
| T004 | T001 | T003 (imports can be added before or during body) |
| T005 | T003, T004 | T006 (different files) |
| T006 | T003, T004 | T005 (different files) |
| T007 | T005 | T008 |
| T008 | T005 | T007 |
| T009 | T005, T006 | T010, T011, T012 |
| T010 | T006 | T009, T011, T012 |
| T011 | T005, T006 | T009, T010, T012 |
| T012 | T005, T006 | T009, T010, T011 |

### Parallel Opportunities

```bash
# Phase 1 — sequential (T002 needs T001's file to exist)
T001 → T002

# Phase 2 — T003 and T004 can be done together (imports + body)
T003 || T004

# Phase 3 + 4 — different files, fully parallel
T005 (ProfilePage) || T006 (HomePage)

# Phase 5 — both verification tasks parallel
T007 || T008

# Phase 6 — all polish tasks parallel
T009 || T010 || T011 || T012
```

---

## Implementation Strategy

### MVP First (User Story 1 — Single Developer)

1. Complete Phase 1: T001 → T002
2. Complete Phase 2: T003 + T004
3. Complete Phase 3: T005
4. **STOP and VALIDATE**: Visit profile page, confirm nav bar visible and "Back to Home" gone
5. If validated → proceed to Phase 4

### Incremental Delivery

1. Phase 1 + 2 → `NavBar` component ready
2. Phase 3 (T005) → Profile page has nav bar, "Back to Home" removed ✅ (US1 done)
3. Phase 4 (T006) → `HomePage` refactored to use shared `NavBar` ✅ (US2 done — no duplication)
4. Phase 5 (T007, T008) → Full regression verified ✅ (US3 done)
5. Phase 6 → Tests + lint pass ✅

---

## Notes

- T005 and T006 are safe to parallelize — they touch different files
- If the `handleCreateClick` toast is called inside the nav bar's Create button, move it into `NavBar.tsx` rather than passing it as a prop
- After T006, `HomePage.tsx` should contain zero nav bar JSX — confirm via grep/search
- The `LogoutDialog` import in `HomePage.tsx` should be removed after T006 (it is now rendered inside `NavBar`)
- All `aria-label` attributes on nav icons MUST be preserved during extraction (WCAG 2.1 AA requirement per constitution)
