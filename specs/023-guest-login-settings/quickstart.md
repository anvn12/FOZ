# Quickstart: Verifying Guest Login & Settings Navigation Menu Fix

## Prerequisites
- Local development servers running (`./start.bat` or `npm run dev`)
- Browser opened at `http://localhost:5173`

## Step-by-Step Verification

### 1. Guest Mode Verification (Desktop)
1. Open `http://localhost:5173` in a new Incognito window or after logging out.
2. Confirm the top-right fixed **Log in** button is present.
3. Click the bottom-left **More / Hamburger menu** icon in the sidebar navigation.
4. Verify the dropdown menu contains:
   - **Log in** (with login icon)
   - **Settings** (with gear icon)
   - **Report a Problem**
5. Click **Log in** -> Verify navigation to `/login`.
6. Return to home (`/`), open More menu, click **Settings** -> Verify navigation to `/settings`.

### 2. Guest Mode Verification (Mobile Viewport)
1. Set browser devtools viewport to Mobile (e.g., iPhone / 375x667).
2. Open top app bar hamburger menu icon.
3. Verify the mobile dropdown menu displays:
   - **Log in**
   - **Settings**
   - **Report a Problem**
4. Click **Log in** -> Verify `/login` navigation.

### 3. Authenticated Mode Verification
1. Log in with test user credentials.
2. Open desktop More menu and mobile drawer menu.
3. Verify the menu displays:
   - **Settings**
   - **Report a Problem**
   - **Log out** (in red)
4. Confirm **Log in** button is hidden when authenticated.

### 4. Automated Component Tests
Run Vitest for NavBar tests:
```bash
npm run test -- src/frontend/src/components/__tests__/NavBar.test.tsx
```
