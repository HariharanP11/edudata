# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository overview

This is a JavaScript/TypeScript monorepo with two independently runnable apps:

- `edudata-frontend` – React 18 + TypeScript + Vite + Tailwind + shadcn/ui, providing role-based dashboards (student, teacher, institution, government, admin), a guided SIH demo flow, and mock data-driven analytics.
- `edudata-backend` – Node.js + Express backend implementing authentication with OTP, user/institution/student/teacher/scheme models, and REST APIs. Persistence is primarily via MongoDB (Mongoose models), with additional MySQL/Sequelize wiring present in `src/config/db.ts` and `src/index.ts`.

The root `package.json` only declares `vite` and is not used for running either app; most work happens inside the two subdirectories.

## Commands and workflows

### Frontend (`edudata-frontend`)

From the repo root:

```bash
cd edudata-frontend
```

Install dependencies:

```bash
npm install
```

Run the development server (Vite):

```bash
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

Lint and type-check the frontend:

```bash
npm run lint
npm run type-check
```

Run tests (Vitest + Testing Library):

```bash
# Watch mode
npm test

# One-off run
npm run test:run

# Coverage
npm run test:coverage
```

Run a single test file (Vitest):

```bash
# Replace with an actual test file path once tests are added
npm test -- src/test/your-test-file.test.tsx
```

### Backend (`edudata-backend`)

From the repo root:

```bash
cd edudata-backend
```

Install dependencies:

```bash
npm install
```

Run the backend in development mode (ts-node-dev on `src/index.ts`):

```bash
npm run dev
```

Build TypeScript and run the compiled server from `dist/`:

```bash
npm run build
npm start
```

Seed initial data (creates a default admin user and any other bootstrap data defined in the seeder):

```bash
npm run seed
```

Run the password-normalization utility (hashes any plain-text passwords in existing `User` documents):

```bash
npx ts-node src/utils/hashPasswords.ts
```

At the time of writing there are no test or lint scripts defined for the backend.

### Running the full stack locally

For an end-to-end local setup using the current defaults:

1. Start MongoDB and ensure `MONGO_URI` in `edudata-backend/.env` points to it.
2. From `edudata-backend`, run `npm run dev` to start the API on `http://localhost:5000`.
3. Ensure `edudata-frontend/.env` has `VITE_API_BASE_URL=http://localhost:5000/api` (or rely on the default in `api.ts`).
4. From `edudata-frontend`, run `npm run dev` and use the credentials described in `edudata-frontend/README.md` for the SIH demo.

## Environment configuration and integration

### Backend (`edudata-backend`)

The backend currently wires up **two** database layers in `src/config/db.ts`:

- A `connectDB()` helper using **Mongoose** and `MONGO_URI` for MongoDB, used by the OTP and user/domain models (`User`, `Otp`, `Student`, `Teacher`, `Institution`, `Scheme`).
- A default export `sequelize` configured for **MySQL** using `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, and `DB_PORT`.

`src/routes/server.ts` uses `connectDB()` and mounts all feature routers under `/api/*`, while `src/index.ts` currently imports `sequelize` and calls `sequelize.authenticate()`/`sequelize.sync()` directly. Be aware of this dual setup when modifying the bootstrap code; most model code (including OTP and user management) is written against MongoDB.

Key backend environment variables in `.env`:

- Database (Mongo): `MONGO_URI` – required for the Mongoose models and OTP flow.
- Database (MySQL/Sequelize): `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT` – used only by the Sequelize instance.
- Server: `PORT` – HTTP port for Express (defaults to `5000`).
- Auth: `JWT_SECRET` – signing key for JWTs (auth middleware and auth controller).
- OTP behaviour (all read in `auth.controller.ts`): `ENABLE_OTP`, `OTP_LENGTH`, `OTP_EXPIRY_MINUTES`, `OTP_RATE_LIMIT_COUNT`, `OTP_RATE_LIMIT_WINDOW_MINUTES`.
- SMS / email delivery: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` and the Gmail-related settings used by `src/utils/emailOtp.ts`.

When Twilio or email settings are not configured, the OTP flow falls back to logging codes to the server console.

### Frontend (`edudata-frontend`)

The frontend reads its configuration from `.env` (see `.env.example` for defaults):

- `VITE_API_BASE_URL` – base URL for the backend API used by `src/services/api.ts`; defaults to `http://localhost:5000/api` if not set.
- `VITE_API_TIMEOUT` – Axios timeout in milliseconds.

Additional `VITE_*` variables in `.env.example` (DB settings, feature flags, etc.) are mostly placeholders for future extensions and are not widely consumed in the current code.

The `apiService` in `src/services/api.ts` automatically attaches a `Bearer` token from `localStorage` (key `token`) and redirects to `/login` on HTTP 401 responses.

## High-level architecture

### Frontend application

- **App shell & routing**: `src/main.tsx` mounts `<App />` into `#root`. `src/App.tsx` sets up global providers (`QueryClientProvider` for React Query, tooltip/toast providers, error boundary) and React Router routes for:
  - `/` → `Index` landing page with the SIH demo entry points.
  - `/login` → login flow.
  - `/dashboard/*` → role-specific dashboards for student, teacher, institution, government, and admin.
- **State and data access**:
  - `src/contexts/AuthContext.tsx` manages logged-in user state, token storage/refresh, and wraps calls to `authService` from `src/services/index.ts`.
  - `src/services/api.ts` defines a shared Axios instance with request/response interceptors for auth; `src/services/index.ts` exposes higher-level domain-specific services (students, teachers, institutions, government, placements, search, file upload).
  - `src/data/mockData.ts` provides rich mock datasets and demo credentials that drive the dashboards and SIH demo experience.
- **UI composition**:
  - `src/pages/*.tsx` implement the main landing page (`Index`), login page, and each role-specific dashboard.
  - `src/components` contains shared building blocks such as `Navbar`, `ProtectedRoute`, error boundaries, loading states, and the `SIHDemo` tour component, plus `components/ui` for shadcn-style primitives.
- **Tooling & tests**:
  - Vitest is configured in `vitest.config.ts` with jsdom, a custom `src/test/setup.ts` (which mocks browser APIs and storage), and alias `@` → `src`.
  - Linting is configured via `eslint.config.js` with TypeScript ESLint, React hooks rules, and React Refresh.

### Backend application

The backend is an Express API with OTP-based authentication and role-oriented resources. Key pieces:

- **Bootstrap**:
  - `src/index.ts` currently constructs an Express app, enables CORS/JSON parsing, mounts `/api/auth` and `/api/students`, and initializes the Sequelize connection.
  - `src/routes/server.ts` offers an alternative boot path that connects to MongoDB via `connectDB()` and mounts `/api/auth`, `/api/institutions`, `/api/students`, `/api/teachers`, and `/api/schemes`. This file is not currently used by `npm run dev` but reflects the original MongoDB-centric design.
- **Models (MongoDB/Mongoose)**:
  - `src/models/User.ts` defines the core identity model with `loginId`, `email`, `phone`, `role`, and a bcrypt-hashed `password`.
  - `src/models/Otp.ts` stores OTP sessions with a hashed code, contact, expiration, and TTL index on `expiresAt`.
  - `src/models/Student.ts`, `src/models/Teacher.ts`, and `src/models/Institution.ts` model domain entities and reference `User`/`Institution` via ObjectIds.
- **Authentication & OTP flow**:
  - `src/controllers/auth.controller.ts` implements `signup`, `login`, `verifyOtp`, `resendOtp`, `resendOtpEmail`, and `me`.
  - `login` verifies user credentials, enforces per-contact OTP rate limiting, creates an OTP session (`Otp` document), sends the code via SMS/email/console, and (when OTP is enabled) returns a `sessionToken` rather than a JWT.
  - `verifyOtp` and `resendOtp`/`resendOtpEmail` manage OTP validation and issuing the final JWT.
  - `src/middleware/auth.middleware.ts` implements Bearer-token JWT verification and attaches the decoded payload to `req.user` for protected routes.
- **Routing**:
  - `src/routes/auth.routes.ts` exposes the auth flow under `/api/auth` (signup, login, OTP verification/resend, and `/me`).
  - `src/routes/students.routes.ts`, `src/routes/institutions.routes.ts`, `src/routes/teachers.routes.ts`, and `src/routes/schemes.routes.ts` provide CRUD-style REST endpoints under `/api/*`, designed to match the frontend `studentService`, `teacherService`, `institutionService`, and `governmentService` APIs.

When extending the backend, pay close attention to which bootstrap path you are targeting (Mongo via `connectDB` vs MySQL via `sequelize`) and keep the route structure consistent with `edudata-frontend/src/services/index.ts`.

## Notes on the existing `edudata-backend/WARP.md`

- Many architectural details in `edudata-backend/WARP.md` (MongoDB models, OTP flow, route structure) still match the current code, but the documented entrypoint (`src/index.ts` importing `dotenv/config` and `startServer` from `src/routes/server.ts`) no longer reflects how `npm run dev` actually starts the server.
- Consider updating that file to:
  - Clarify the coexistence of `src/index.ts` and `src/routes/server.ts`, and which one is used by each script.
  - Mention the MySQL/Sequelize configuration in `src/config/db.ts` alongside the MongoDB `connectDB` helper.
  - Keep the environment variable list in sync with the DB and OTP/email/Twilio settings actually used in code.
- This top-level `WARP.md` is intended to complement, not replace, the backend-specific one; prefer putting deep backend-only details in `edudata-backend/WARP.md` and using this file for cross-cutting repo context.