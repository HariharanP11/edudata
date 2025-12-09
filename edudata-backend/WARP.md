# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands and workflows

### Install dependencies

Use npm (Node.js TypeScript backend):

```bash path=null start=null
npm install
```

### Run the development server

Runs the Express server with `ts-node-dev` against the TypeScript sources:

```bash path=null start=null
npm run dev
```

The entrypoint is `src/index.ts`, which loads environment variables via `dotenv/config` and then calls `startServer` from `src/routes/server.ts`.

### Build and run in production mode

Type-check and compile TypeScript to JavaScript in `dist/`:

```bash path=null start=null
npm run build
```

Run the compiled server (uses `dist/index.js`):

```bash path=null start=null
npm start
```

### Database seeding and utilities

Seed minimal data (e.g. admin user) into MongoDB:

```bash path=null start=null
npm run seed
```

Run the password-hashing utility to convert any plain-text passwords in existing `User` documents into bcrypt hashes:

```bash path=null start=null
npx ts-node src/utils/hashPasswords.ts
```

### Linting and tests

There is currently no lint script or test script defined in `package.json`, and no test files or lint configuration in this repository. To add tests or linting, you will need to introduce the relevant tooling first.

## Environment and configuration

Application configuration is driven by `.env` and consumed primarily in `src/index.ts`, `src/config/db.ts`, and `src/controllers/auth.controller.ts`.

Key variables used by the codebase:

- `MONGO_URI` — required MongoDB connection string (used by `connectDB` in `src/config/db.ts` and by the utilities in `src/utils`).
- `PORT` — optional HTTP port for the Express server; defaults to `5000` if not set (see `startServer` in `src/routes/server.ts`).
- `JWT_SECRET` — secret key for signing and verifying JWTs in `auth.controller.ts` and `auth.middleware.ts`; defaults to `changeme` if missing.
- OTP feature flags and tuning (all read in `src/controllers/auth.controller.ts`):
  - `ENABLE_OTP` — when set to `"true"`, enables the two-step login flow (password then OTP). If absent or not `"true"`, login issues a JWT immediately on successful password verification.
  - `OTP_LENGTH` — number of digits in the generated OTP (default `6`).
  - `OTP_EXPIRY_MINUTES` — OTP lifetime in minutes (default `5`).
  - `OTP_RATE_LIMIT_COUNT` — maximum OTPs allowed per contact within the rate-limit window (default `3`).
  - `OTP_RATE_LIMIT_WINDOW_MINUTES` — size of the rate-limit window in minutes (default `10`).
- Twilio SMS configuration (all optional, used in `auth.controller.ts`):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`

When Twilio credentials are missing or invalid, OTPs fall back to logging codes to the server console instead of sending SMS.

## High-level architecture

### Entry point and server setup

- `src/index.ts` is the main entrypoint. It:
  - Imports `dotenv/config` so that environment variables from `.env` are available process-wide.
  - Imports and invokes `startServer` from `src/routes/server.ts`.
- `src/routes/server.ts` defines `startServer`:
  - Creates an Express app, configures CORS and JSON body parsing.
  - Mounts feature-specific routers under `/api/*`:
    - `/api/auth` → `auth.routes.ts`
    - `/api/institutions` → `institutions.routes.ts`
    - `/api/students` → `students.routes.ts`
    - `/api/teachers` → `teachers.routes.ts`
    - `/api/schemes` → `schemes.routes.ts`
  - Calls `connectDB` from `src/config/db.ts` to establish a MongoDB connection before starting the HTTP listener.

### Database layer

- `src/config/db.ts` exports `connectDB`, a small wrapper around `mongoose.connect`:
  - Reads `MONGO_URI` from the environment, throws if missing.
  - Logs connection success and exits the process on connection failure.
- Mongoose models in `src/models` encapsulate the core domain entities:
  - `User.ts` — authentication and identity:
    - Fields: `loginId`, `name`, `role`, `email`, `phone`, `password`, timestamps.
    - `role` is an enum (`student`, `teacher`, `institution`, `government`, `admin`).
    - Enforces unique `email` and (sparse) unique `loginId`.
  - `Otp.ts` — one-time passwords for login:
    - Stores a random `token` (the OTP session identifier), a hashed `code`, `contact` (phone or email), `expiresAt`, `used`, and an optional `userId` reference.
    - Includes a TTL index on `expiresAt` so expired OTPs are automatically cleaned up by MongoDB.
  - `Institution.ts`, `Student.ts`, `Teacher.ts`, `Scheme.ts` — domain models for institutions, students, teachers, and schemes:
    - `Student` and `Teacher` reference `User` and optionally `Institution`, enabling population of related documents in route handlers.

### HTTP routing and controllers

- Route modules in `src/routes` define URL structure and attach controllers/middleware:
  - `auth.routes.ts`:
    - Public endpoints: `POST /signup`, `POST /login`.
    - OTP flow endpoints: `POST /verify-otp`, `POST /resend-otp`.
    - Protected endpoint: `GET /me` (uses `authMiddleware`).
  - `institutions.routes.ts`, `students.routes.ts`, `teachers.routes.ts`, `schemes.routes.ts`:
    - Each file defines CRUD-style routes on its base path.
    - `GET /` returns a list.
    - `POST /` (protected by `authMiddleware`) creates a new document.
    - `GET /:id` fetches a document by id.
    - `PUT /:id` (protected) updates a document.
    - `DELETE /:id` (protected) deletes a document.
    - Student/teacher list endpoints populate related `user` and `institution` data.

- `src/controllers/auth.controller.ts` centralizes authentication logic:
  - `signup`:
    - Accepts `name`, `email`, `password`, `role`, optional `loginId` and `phone`.
    - Ensures uniqueness across `email` and `loginId`.
    - Hashes the password with bcrypt and creates the `User`.
    - Issues a JWT containing `id`, `email`, and `role` (7-day expiry) and returns the user document without the password.
  - `login`:
    - Accepts either `{ email, password }` or `{ loginId, password }`.
    - Verifies the password against the stored bcrypt hash.
    - If `ENABLE_OTP` is not enabled, issues a JWT immediately (same payload/expiry as `signup`).
    - If OTP is enabled:
      - Applies per-contact rate limiting based on `Otp` documents and the `OTP_RATE_LIMIT_*` settings.
      - Generates a numeric OTP code (length `OTP_LENGTH`), hashes it with bcrypt, creates an `Otp` document with an expiration timestamp.
      - Sends the code via Twilio SMS when configured, or logs it to the console otherwise.
      - Returns `{ otpRequired: true, sessionToken, message }` without issuing a JWT yet.
  - `verifyOtp`:
    - Accepts `{ sessionToken, code }`.
    - Validates the `Otp` session (exists, not used, not expired).
    - Compares the provided OTP code against the stored bcrypt hash.
    - Marks the OTP as used and then issues a JWT for the associated user, again omitting the password from the response.
  - `resendOtp`:
    - Accepts `{ sessionToken }` for an existing OTP session.
    - Enforces the same rate limiting as `login`.
    - Creates a new OTP code and session token, sends the OTP, and returns the new token.
  - `me`:
    - Reads `req.user.id` (set by the auth middleware), fetches the user, and returns it without the password.

### Authentication middleware

- `src/middleware/auth.middleware.ts` defines `authMiddleware` and `AuthRequest`:
  - Expects an `Authorization: Bearer <token>` header.
  - Verifies the JWT using `JWT_SECRET` and attaches the decoded payload to `req.user`.
  - Responds with `401` if the token is missing or invalid.
  - Used to protect routes that modify data and the `/api/auth/me` endpoint.

### Utility scripts

- `src/utils/seed.ts`:
  - Uses `connectDB` to connect to MongoDB.
  - Ensures a default admin user exists (email `admin@test.com`, password hash based on `"password123"`, role `admin`).
  - Intended to be run via the `npm run seed` script.
- `src/utils/hashPasswords.ts`:
  - Connects to MongoDB directly with Mongoose and iterates over all `User` documents.
  - For each user, detects whether the `password` field is already a bcrypt hash (string starting with `$2`).
  - Hashes any non-hashed password values with bcrypt and saves the updated user documents.
  - Exits the process with a success or failure code after completion.
