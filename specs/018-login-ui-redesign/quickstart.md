# Quickstart & Verification Guide: Login UI Redesign

## Setup & Running Locally

1. Start local frontend development server:
   ```bash
   cd src/frontend
   npm run dev
   ```
2. Open browser and navigate to `http://localhost:5173/login` (or dev server port).

## Verification Matrix

| Verification Scenario | Steps | Expected Result |
|-----------------------|-------|-----------------|
| **1. Glassmorphic Styling** | Inspect `/login` on browser | Background uses `#f9f9ff` canvas with translucent glass container (`backdrop-filter: blur(20px)`), specular borders, and gradient primary button (`#2E7DFF` to `#9D3BFF`). |
| **2. Responsive Split (Desktop)** | View at viewport width >= 768px | 50/50 split layout is active. Left section displays "Focus on Zillions." hero text and interactive trending carousel. Right section displays glass login card. |
| **3. Responsive Stack (Mobile)** | View at viewport width < 768px | Single-column vertical layout is active. Top brand header bar with FOZ logo is displayed. Hero panel is hidden/stacked. Login card is horizontally centered. |
| **4. Trending Carousel** | Observe desktop hero panel for 15s | Carousel automatically cycles through 3 slides every 5s. Clicking left/right navigation arrow buttons manually changes the active slide immediately. |
| **5. Form Submission & Validation** | Submit empty form, then submit valid credentials | Validation errors show up under invalid fields. Submitting valid credentials triggers loading state on button and navigates to home page (`/`). |
| **6. Navigation Links** | Click "Create new account" & "Forgotten password?" | "Create new account" navigates to `/register`. "Forgotten password?" links to `/forgot-password` (or displays toast fallback if route unconfigured). |
