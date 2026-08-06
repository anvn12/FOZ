# Tasks: Mobile Login UI Redesign (White Mode Lumina)

**Input**: Design documents from `/specs/020-mobile-login-redesign/`  
**Prerequisites**: [plan.md](file:///d:/FOZ/specs/020-mobile-login-redesign/plan.md), [spec.md](file:///d:/FOZ/specs/020-mobile-login-redesign/spec.md), [research.md](file:///d:/FOZ/specs/020-mobile-login-redesign/research.md), [data-model.md](file:///d:/FOZ/specs/020-mobile-login-redesign/data-model.md), [login-ui-contract.md](file:///d:/FOZ/specs/020-mobile-login-redesign/contracts/login-ui-contract.md)

**Tests**: Component tests included for form controls, responsive behavior, and authentication submission.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify repository branch and environment baseline

- [X] T001 Verify branch `020-mobile-login-redesign` and frontend environment setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS glass utility classes and shared social login component prerequisites

- [X] T002 [P] Update glassmorphism utility classes (`.glass-panel`, `.input-glass`, `.shader-bg`, `.shader-orb`, `.btn-gradient`) in `src/frontend/src/index.css`
- [X] T003 [P] Update social authentication component to render single full-width "Continue with Google" button in `src/frontend/src/components/SocialLoginButtons.tsx`

---

## Phase 3: User Story 1 - Mobile Glassmorphic Login Experience & Form Controls (Priority: P1) 🎯 MVP

**Goal**: Implement complete mobile-optimized login view (< 768px wide) with top header, frosted glass card, credentials inputs, password toggle, gradient action button, and navigation links.

**Independent Test**: Navigate to `/login` on mobile emulator (< 768px width), enter valid/invalid credentials, toggle password visibility, submit form, verify loading state and redirection to `/`.

### Tests for User Story 1

- [X] T004 [P] [US1] Create component unit tests for mobile login form rendering, password visibility toggle, and submit handler in `src/frontend/src/pages/__tests__/LoginPage.test.tsx`

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement mobile top navigation header with FOZ logo and gradient title in `src/frontend/src/pages/LoginPage.tsx`
- [X] T006 [US1] Implement mobile brand headline section ("Focus on Zillions.") with gradient text highlight in `src/frontend/src/pages/LoginPage.tsx`
- [X] T007 [US1] Refactor frosted glass login card container (`.glass-panel`) with touch-friendly input fields and password visibility toggle in `src/frontend/src/pages/LoginPage.tsx`
- [X] T008 [US1] Implement gradient primary submit button ("Log in" + right arrow icon) with submit loading state in `src/frontend/src/pages/LoginPage.tsx`
- [X] T009 [US1] Add secondary navigation links for "Forgotten password?" (`/forgot-password`) and "Create new account" (`/register`) in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: User Story 1 complete - mobile login screen is fully functional and testable independently.

---

## Phase 4: User Story 2 - Responsive Visual & Design Token Alignment across Breakpoints (Priority: P2)

**Goal**: Render animated background shader color orbs (`#afc6ff` & `#dbb8ff`) and transition layout dynamically between single-column mobile view (< 768px) and 50/50 split desktop view (≥ 768px) with left hero panel.

**Independent Test**: Resize viewport from 320px to 1440px. Confirm animated floating shader orbs render smoothly behind glass panels, and confirm desktop left hero panel with trending carousel renders at ≥ 768px while mobile view stacks cleanly at < 768px.

### Implementation for User Story 2

- [X] T010 [P] [US2] Add ambient background shader canvas (`.shader-bg`) with floating color orbs (`orb-1` & `orb-2`) in `src/frontend/src/pages/LoginPage.tsx`
- [X] T011 [US2] Implement responsive layout container switching between mobile single-column vertical stack (< 768px) and desktop 50/50 split screen (≥ 768px) in `src/frontend/src/pages/LoginPage.tsx`
- [X] T012 [US2] Integrate desktop brand hero panel with interactive trending carousel (`TrendingCarousel.tsx`) for viewports ≥ 768px in `src/frontend/src/pages/LoginPage.tsx`

**Checkpoint**: User Story 1 AND User Story 2 work independently and respond seamlessly across all screen sizes.

---

## Phase 5: User Story 3 - Mobile Touch Target Optimization & Social Login Access (Priority: P3)

**Goal**: Optimize all touch interactive elements to satisfy minimum 44px height requirements and integrate single full-width Google social login button.

**Independent Test**: Verify all interactive elements (inputs, buttons, links) have minimum 44px touch targets, and tapping "Continue with Google" initiates Google OAuth workflow.

### Implementation for User Story 3

- [X] T013 [P] [US3] Integrate single full-width `SocialLoginButtons` ("Continue with Google") with "or continue with" divider into mobile login card in `src/frontend/src/pages/LoginPage.tsx`
- [X] T014 [US3] Validate minimum 44px touch target heights (`min-h-[44px]` / `py-3`) and touch-friendly padding across all form controls and links in `src/frontend/src/pages/LoginPage.tsx`


**Checkpoint**: All user stories fully functional, touch-optimized, and verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, automated tests, and cross-device visual alignment

- [X] T015 [P] Run Vitest component tests to verify form interaction coverage in `src/frontend/src/pages/__tests__/LoginPage.test.tsx`
- [X] T016 Run quickstart.md validation checklist across mobile (375px) and desktop (1440px) viewports to confirm 0 horizontal scrollbars


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - US1 (P1) → US2 (P2) → US3 (P3)
- **Polish (Phase 6)**: Depends on completion of all user story implementation tasks

### Parallel Opportunities

- T002 & T003 in Foundational phase can run in parallel (different CSS/component files)
- T004 & T005 in User Story 1 can run in parallel
- T010 & T011 in User Story 2 can run in parallel
- T013 in User Story 3 can run in parallel with touch target checks T014

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup (Phase 1) + Foundational (Phase 2)
2. Complete User Story 1 (Phase 3)
3. **STOP and VALIDATE**: Verify mobile login UI on mobile viewport
4. Proceed to User Story 2 and 3 for responsive split-screen & social login polish
