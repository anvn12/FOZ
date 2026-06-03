# Quickstart: Threads Platform — Core MVP

**Prerequisites**:
- Node.js 20 LTS
- npm 10+
- MS SQL Server (local instance or Docker)
- Git

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd FOZ-1

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

---

## 2. Database Setup

### Create the database

Connect to your MS SQL Server instance and create a new database:

```sql
CREATE DATABASE foz_dev;
```

### Configure environment

Create `server/.env`:

```env
DATABASE_URL="sqlserver://localhost:1433;database=foz_dev;user=sa;password=YourPassword;trustServerCertificate=true"
SESSION_SECRET="dev-secret-change-in-prod"
PORT=3000
CLIENT_URL="http://localhost:5173"
```

### Run migrations and seed

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

After seeding you should see confirmation that 5 users, 15+ threads, and
sample replies/likes/follows were created.

---

## 3. Run the Application

Open two terminals:

**Terminal 1 — Server**:
```bash
cd server
npm run dev
# Express + Socket.io running on http://localhost:3000
```

**Terminal 2 — Client**:
```bash
cd client
npm run dev
# Vite dev server running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 4. Verify Core Flows

### Identity Selection
- The app opens on the user selection screen.
- Five user cards are visible, each with a name and avatar.
- Click any user — you should land on the feed as that user.

### Feed
- Threads appear in newest-first order.
- Scroll to the bottom — older threads load automatically.
- Click the refresh button (top of feed) — feed reloads without losing your selected identity.

### Create a Thread
- Click the compose button.
- Type text (character counter should appear).
- Optionally attach an image.
- Submit — thread appears at the top of the feed.

### Real-Time Counts
- Open the app in two browser tabs, select different users in each.
- In tab 1: like a thread.
- In tab 2: the like count on that thread updates within ~3 seconds (no refresh needed).

### Reply
- Click Reply on any thread.
- Submit a reply.
- The reply appears below the thread with a visual connector.

### Delete
- Find a thread or reply you authored.
- Click Delete and confirm.
- The content disappears from the feed.
- Content by other users shows no delete option.

---

## 5. Scripts Reference

| Location | Command | Purpose |
|---|---|---|
| `server/` | `npm run dev` | Start server with hot reload (ts-node-dev) |
| `server/` | `npm run build` | Compile TypeScript to `dist/` |
| `server/` | `npm start` | Run compiled server |
| `server/` | `npm test` | Run Vitest unit tests |
| `server/` | `npx prisma studio` | Open Prisma visual DB browser |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Production build to `dist/` |
| `client/` | `npm test` | Run Vitest unit tests |

---

## 6. Image Uploads

Uploaded images are stored in `server/uploads/`. This directory is served
as static files at `/uploads/<filename>`. It is NOT committed to git
(add to `.gitignore`). Images persist only on the machine running the server.

---

## 7. Troubleshooting

| Issue | Fix |
|---|---|
| `DATABASE_URL` connection error | Verify SQL Server is running and credentials match |
| `trustServerCertificate` error | Add `trustServerCertificate=true` to DATABASE_URL |
| CORS error in browser | Ensure `CLIENT_URL` in `.env` matches the Vite dev server URL exactly |
| Socket.io not connecting | Confirm server is running on port 3000 before starting client |
| Seed fails | Run `npx prisma migrate reset` then `npx prisma db seed` |
