# Quickstart: Mobile Login UI Redesign (White Mode Lumina)

Follow these steps to run the application locally and verify the mobile login screen design across mobile and desktop viewports.

## 1. Prerequisites

- Node.js LTS (pinned in `.nvmrc`)
- Dependencies installed: `npm install`
- Environment variables configured in `.env` (or default local settings)

---

## 2. Running the Development Server

Start the frontend development server:

```bash
npm run dev
```

The frontend will be accessible at: `http://localhost:5173/` (or the port specified by Vite).

---

## 3. Verifying Mobile Viewport Layout

1. Open browser to `http://localhost:5173/login`.
2. Open Chrome/Firefox DevTools (`F12` or `Cmd+Option+I`).
3. Toggle Device Toolbar (`Ctrl+Shift+M` or `Cmd+Shift+M`).
4. Select a mobile device preset (e.g., **iPhone 14 / Pixel 7** at **390px** width) or set custom width to **375px**.

### Verification Checklist:
- [ ] Top navbar renders with centered FOZ logo and gradient brand name.
- [ ] Brand headline displays "Focus on Zillions." with gradient text on "Zillions.".
- [ ] Login card features frosted glass background with `backdrop-filter: blur(20px)` and subtle highlight border.
- [ ] Email/username and password inputs have glass styling (`input-glass`) with `#2E7DFF` focus glow.
- [ ] Password visibility toggle (eye icon) correctly switches password dots to text.
- [ ] Primary submit button displays 135° linear gradient (`#2E7DFF` to `#9D3BFF`) with "Log in" label and right arrow icon.
- [ ] Secondary action button "Create new account" links to `/register`.
- [ ] "Forgotten password?" link points to `/forgot-password`.
- [ ] Social authentication section shows "or continue with" line and a single full-width "Continue with Google" glass button.
- [ ] Background soft floating gradient orbs (`#afc6ff` & `#dbb8ff`) float smoothly behind glass panels without lag or scrollbars.

---

## 4. Verifying Responsive Transition to Desktop

1. Drag viewport width above **768px** (e.g., **1024px** or **1440px**).
2. Confirm the page transitions seamlessly to a 50/50 split screen layout.
3. Confirm left panel displays hero title, subtext, and trending topics carousel.
4. Confirm right panel displays centered glassmorphic login card with identical design tokens.

---

## 5. Running Automated Tests

Run Vitest component tests:

```bash
npm run test
```
