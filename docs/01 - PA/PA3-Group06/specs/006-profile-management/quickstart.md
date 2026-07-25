# Quickstart: Profile Management

This guide helps you set up, run, and test the profile management feature.

## Development Setup

1. **Verify Database Status**: Ensure PostgreSQL is running.
   ```bash
   docker compose up -d
   ```
2. **Apply Migrations**: Ensure database schema matches latest index.
   ```bash
   npm run db:push  # or equivalent drizzle-kit pushes
   ```
3. **Start Servers**:
   - Backend API server (runs on port 4000):
     ```bash
     npm run dev:backend
     ```
   - Frontend Vite server (runs on port 5173):
     ```bash
     npm run dev:frontend
     ```

---

## Running Tests

We use **Vitest** for running all tests.

### 1. Run Backend Profile Tests
To execute backend API integration and validation tests:
```bash
npx vitest run src/backend/api/profile/profile.test.ts
```

### 2. Run Frontend Profile UI & Hook Tests
To execute frontend component and pages tests:
```bash
npx vitest run src/frontend/src/pages/__tests__/ProfilePage.test.tsx
npx vitest run src/frontend/src/components/__tests__/ProfileForm.test.tsx
```

### 3. Run Full Suite
To execute the entire workspace testing matrix:
```bash
npm run test
```

---

## API Quick Check (cURL Examples)

To test the backend manually:

### 1. View User Profile
```bash
curl -X GET http://localhost:4000/api/v1/profiles/YOUR_USER_ID_UUID
```

### 2. Update Profile
```bash
curl -X PATCH http://localhost:4000/api/v1/profiles/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "New Name", "bio": "Hello World"}'
```
