# Frontend Tech Stack

Author: Võ An Phú  
Status: Proposed

This document fixes the frontend stack for FOZ 

> Reading order: the table is the contract. The sections after it are the
> reasoning, ordered the same way. If you want to change a row, update the
> table *and* its section in the same PR.

## Stack at a glance

| Layer | Choice | Version floor |
| --- | --- | --- |
| Build tool | Vite | 5 |
| Framework | React + TypeScript | 18 / 5 |
| Styling | Tailwind CSS (vanilla config, **no** UI component lib) | 3 |
| Routing | react-router-dom | 6 |
| Server state | @tanstack/react-query | 5 |
| Client state | zustand | 5 |
| Realtime | socket.io-client | 4 |
| Forms | react-hook-form | 7 |
| Toasts | react-hot-toast | 2 |
| Tests | Vitest | 2 |
| Lint/format | ESLint + Prettier | latest |
| Module system | ESM, `moduleResolution: "bundler"`, `noEmit` | — |

All packages should live in `src/frontend/` (per the repo structure in `README.md`).

---

