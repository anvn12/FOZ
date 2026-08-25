# Implementation Plan: Feedback Menu Button & Dialog

**Branch**: `024-feedback-dialog` | **Date**: 2026-08-12 | **Spec**: [spec.md](file:///d:/FOZ/specs/024-feedback-dialog/spec.md)

**Input**: Feature specification from `/specs/024-feedback-dialog/spec.md`

## Summary

Replace the placeholder "Report a Problem" menu item in `NavBar.tsx` with a "Feedback" menu item. Clicking "Feedback" opens an accessible modal dialog (`FeedbackDialog.tsx`) instructing users to contact `support@foz.com` with a `mailto:` link and a quick-copy button with toast notification feedback.

## Technical Context

**Language/Version**: TypeScript 5.x / ESM (Vite + React)  
**Primary Dependencies**: React, Tailwind CSS, Lucide React icons, `react-hot-toast`  
**Storage**: N/A (Client-side UI feature)  
**Testing**: Vitest + `@testing-library/react`  
**Target Platform**: Responsive Web Browsers (Desktop & Mobile)  
**Project Type**: Web application frontend (`src/frontend/`)  
**Performance Goals**: Modal trigger & open response under 100 milliseconds (SC-001)  
**Constraints**: Compliant with WCAG 2.1 AA accessibility standards (keyboard focus, ARIA, Escape key handling)  
**Scale/Scope**: 1 new component (`FeedbackDialog.tsx`), 1 updated component (`NavBar.tsx`), 2 test suites  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Client-Server Architecture**: ✅ PASS. Pure client-side UI feature contained in `src/frontend/`.
- **Principle II: Enforced Folder Structure**: ✅ PASS. Files placed strictly in `src/frontend/src/components/` and `src/frontend/src/components/__tests__/`.
- **Principle III: Clean Code & Reusability**: ✅ PASS. Component follows single-responsibility pattern and uses existing toast mechanism (`react-hot-toast`).
- **Principle IV: Security at Every Layer**: ✅ PASS. No sensitive data logged or stored; safe browser APIs (`navigator.clipboard`) used.
- **Principle V: Consistency Over Cleverness**: ✅ PASS. Reuses established FOZ backdrop/modal styling tokens (`bg-tertiary/40 backdrop-blur-xl animate-foz-pop`).
- **Principle VI: AI Service Boundaries**: N/A. No AI services involved.
- **Principle VII: Accessibility**: ✅ PASS. Fully navigable by keyboard, includes `aria-modal` and `aria-label`, dismissible via `Escape` key.

## Project Structure

### Documentation (this feature)

```text
specs/024-feedback-dialog/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 component data model
├── quickstart.md        # Phase 1 verification steps
├── contracts/           # Phase 1 component contracts
│   └── feedback-dialog-ui.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Layout

```text
src/frontend/src/
├── components/
│   ├── FeedbackDialog.tsx           # [NEW] Modal dialog with contact instructions & copy email button
│   ├── NavBar.tsx                   # [MODIFY] Replace "Report a Problem" with "Feedback" item & dialog state
│   └── __tests__/
│       ├── FeedbackDialog.test.tsx  # [NEW] Unit/integration tests for FeedbackDialog modal
│       └── NavBar.test.tsx          # [MODIFY] Updated test suite for "Feedback" menu button
```

**Structure Decision**: Standard FOZ web application structure (`src/frontend/src/components/`).

## Complexity Tracking

*No constitution violations. Zero complexity penalty.*
