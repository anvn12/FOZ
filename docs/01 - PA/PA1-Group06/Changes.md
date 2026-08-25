# Changes Made for PA1

## E - Development Tools and Process Setup

**Performer:** Võ An Phú (24127494) | **Reviewer:** Nguyễn Tuấn An (24127011)

| Section | Subsection | Item | Before | After | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **E - Development Tools and Process Setup** | 3. GitHub Repository | Folder Structure Tree | Placeholder / tentative 2-tier tree layout with basic `src/`, `docs/`, `tests/` folders | Comprehensive multi-tier directory tree accurately reflecting current project state (including `.specify/`, `ai-logs/`, `specs/`, detailed `src/frontend/`, `src/backend/`, `src/shared/`, organized `docs/`, and root architecture/docker configs) | Synchronize documentation with the actual modular client-server architecture, SpecKit setup, and full repository organization |

---

### Detailed Description of Changes

1. **Repository Folder Structure Tree (Section E.3):**
   - **SpecKit & AI Governance:** Added `.specify/` (containing constitution, memory, templates, and workflows) and `ai-logs/` (team AI usage logging per member) to the root directory tree.
   - **Documentation Organization (`docs/`):** Expanded `docs/` hierarchy to reflect current folders: `00 - Old-PA-docs/`, `01 - PA/` (PA1–PA5 deliverables), `02 - Meeting-minutes/` (Scrum meeting minutes & sprint plans), `03 - UI-designs/` (Dark & Light mode mockups), `QA report/` (Test plans and QA test cases), `Techstack/` (Backend and Frontend technical specs), and `ideas/`.
   - **SpecKit Features (`specs/`):** Added `specs/` directory representing active feature specifications (`001` through `026`).
   - **Modular Source Code (`src/`):** Detailed internal package structure matching project constitution:
     - `src/backend/`: Express 5 REST API + Drizzle ORM (`__tests__/`, `api/`, `db/`, `lib/`, `services/`).
     - `src/frontend/`: React 19 + TypeScript + Vite SPA (`src/api/`, `src/components/`, `src/hooks/`, `src/pages/`, `src/stores/`, `src/utils/`).
     - `src/shared/`: Centralized Zod validation schemas, DTOs, and shared enums (single source of truth).
   - **Root Infrastructure & Configs:** Added `ARCHITECTURE.md` (C4 diagrams and system documentation), `docker-compose.yml` (PostgreSQL 16 container setup), `package.json`, `.env.example`, and `README.md`.
