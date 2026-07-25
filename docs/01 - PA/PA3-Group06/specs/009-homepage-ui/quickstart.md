# Quickstart: Homepage UI

Follow these instructions to start, build, and verify the Homepage UI changes.

## 1. Run Development Server

Launch all backend and frontend services via the startup batch file at the workspace root:

```powershell
./start.bat
```

This starts:
- Database container via Docker
- Backend server on port `4000`
- Vite frontend dev server on port `5173`

## 2. Compile and Verify TypeScript Types

Verify that the type checking script passes with no compiler defects:

```bash
npm run typecheck
```

## 3. Run Automated Tests

Execute the unit/integration tests for the new page layout:

```bash
npx vitest run HomePage.test.tsx
```

To run the entire test suite (excluding search):

```bash
npx vitest run --exclude src/backend/__tests__/integration/search.test.ts
```
