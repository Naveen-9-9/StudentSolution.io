# Stack

## Languages & Runtime

| Language | Version | Usage |
|----------|---------|-------|
| JavaScript (CommonJS) | ES2020+ | Backend (Node.js) |
| TypeScript | ^5 | Frontend (Next.js) |

**Runtime:** Node.js (v16+)

## Backend Framework

- **Express.js** `^5.2.1` — HTTP server, routing, middleware pipeline
- Entry: `server.js` → `app.js`
- Port: `5000` (configurable via `PORT` env)

## Frontend Framework

- **Next.js** `16.2.1` — React framework with App Router
- **React** `19.2.4` / **React DOM** `19.2.4`
- Port: `3000` (default Next.js dev)
- Uses App Router (`src/app/` directory structure)

## Database

- **MongoDB Atlas** — Cloud-hosted MongoDB
- **Mongoose** `^9.3.1` — ODM for schema definitions, validation, middleware
- **mongoose-paginate-v2** `^1.9.3` — Paginated queries on tools

## Authentication

- **Passport.js** `^0.7.0` — Authentication middleware
  - `passport-local` `^1.0.0` — Email/password strategy
  - `passport-google-oauth20` `^2.0.0` — Google OAuth strategy
  - `passport-jwt` `^4.0.1` — JWT bearer token strategy
- **jsonwebtoken** `^9.0.3` — JWT generation/verification
- **bcryptjs** `^3.0.3` — Password hashing

## Validation

- **Joi** `^18.0.2` — Request body/query/params validation (server-side)

## Security

- **helmet** `^8.1.0` — HTTP security headers
- **cors** `^2.8.6` — Cross-origin resource sharing
- **express-rate-limit** `^8.3.1` — Rate limiting (general + auth-specific)

## Logging

- **Pino** `^10.3.1` — Structured JSON logging
- **pino-pretty** `^13.1.3` — Dev log formatting
- **morgan** `^1.10.1` — HTTP request logging

## Frontend UI

- **Tailwind CSS** `^4` — Utility-first CSS (with PostCSS plugin `@tailwindcss/postcss`)
- **shadcn** `^4.1.0` — UI component system
- **Radix UI** `^1.4.3` — Headless accessible UI primitives
- **Framer Motion** `^12.38.0` — Animation library
- **Lucide React** `^0.577.0` — Icon library
- **class-variance-authority** `^0.7.1` — Component variant management
- **clsx** `^2.1.1` + **tailwind-merge** `^3.5.0` — Class name utilities
- **tw-animate-css** `^1.4.0` — Tailwind animation utilities
- **Geist** + **Geist Mono** — Google Fonts

## Testing

- **Jest** `^30.3.0` — Test runner
- **Supertest** `^7.2.2` — HTTP assertion library
- **mongodb-memory-server** `^11.0.1` — In-memory MongoDB for tests

## Dev Tools

- **nodemon** `^3.1.14` — Auto-restart server on changes
- **ESLint** `^9` + `eslint-config-next` — Frontend linting
- **Docker** + **Docker Compose** — Containerization

## Configuration

- **dotenv** `^17.3.1` — Environment variable loading from `.env`
- Key env vars: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PORT`, `CLIENT_URL`, `LOG_LEVEL`, `NODE_ENV`
