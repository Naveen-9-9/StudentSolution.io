# Architecture

## Pattern: Layered Monolith with Feature Slices

The backend follows a **domain-driven feature-slice architecture** within a monolithic Express app. Each feature (users, tools, ratings, search) is isolated into its own `apps/` subdirectory with three standard layers.

The frontend is a **Next.js App Router** application that communicates with the backend via REST API.

## Backend Layers

### 1. Entry Points (Routes)
- **Location:** `apps/{feature}/entry-points/`
- **Responsibility:** Express routers defining API endpoints, applying middleware (auth, validation, rate limiting)
- **Pattern:** Each route uses `asyncHandler` wrapper for error propagation

### 2. Domain (Business Logic)
- **Location:** `apps/{feature}/domain/`
- **Responsibility:** Service classes containing all business logic
- **Pattern:** Singleton service instances exported as `module.exports = new XxxService()`
- **Dependencies:** Only downward — domain calls data-access, never entry-points

### 3. Data Access (Models)
- **Location:** `apps/{feature}/data-access/`
- **Responsibility:** Mongoose schema/model definitions with indexes, virtuals, static/instance methods
- **Pattern:** Schemas include validation, indexes, and convenience methods

## Cross-Cutting Concerns

### Middleware Pipeline (`middleware/`)
```
Request → helmet → cors → rate-limit → morgan → body-parser → [auth] → route → errorHandler
```

- `passport.js` — Three auth strategies (local, Google OAuth, JWT)
- `jwt.js` — Token generation (15m access, 7d refresh) and verification
- `roles.js` — Role-based access control
- `validate.js` — Joi schema validation middleware (body, query, params)
- `errorHandler.js` — Centralized error handler mapping error types to HTTP responses

### Shared Libraries (`libraries/`)
- `errors.js` — Custom error hierarchy (AppError → ValidationError, AuthError, NotFoundError, etc.)
- `logger.js` — Pino logger instance

## Frontend Architecture

### App Router Structure
```
frontend/src/
├── app/           ← Pages (Next.js App Router)
│   ├── page.tsx   ← Home page (tool listing, categories, search)
│   ├── layout.tsx ← Root layout with AuthProvider
│   ├── auth/      ← Login/register pages
│   ├── dashboard/ ← User dashboard
│   ├── search/    ← Search results page
│   └── tools/     ← Tool detail pages
├── components/    ← Reusable UI components
│   ├── SearchBar.tsx
│   └── ui/        ← shadcn UI components
├── context/       ← React context providers
│   └── AuthContext.tsx ← Auth state management
└── lib/           ← Utilities
    ├── api.ts     ← API client (fetchApi wrapper)
    ├── types.ts   ← TypeScript interfaces (Tool, Comment, etc.)
    └── utils.ts   ← General utilities
```

### State Management
- **Auth state:** React Context (`AuthContext`) with `localStorage` token persistence
- **Page data:** Component-level `useState` + `useEffect` for data fetching
- **No global state library** — Each page fetches its own data

## Data Flow

```
User Browser → Next.js Frontend (port 3000)
                  ↓ fetchApi() with Bearer token
              Express Backend (port 5000)
                  ↓ Mongoose ODM
              MongoDB Atlas (cloud)
```

### Auth Flow
1. **Register/Login:** Frontend → `POST /auth/register|login` → Backend returns JWT tokens
2. **Google OAuth:** Frontend redirects to `/auth/google` → Google → callback → JWT tokens
3. **Protected routes:** Frontend sends `Authorization: Bearer <token>` → JWT middleware validates
4. **Token refresh:** Frontend can call `POST /auth/refresh` with refresh token

## Component Boundaries

| Component | Talks To | Data Direction |
|-----------|----------|---------------|
| Frontend Pages | Backend API | HTTP REST (read/write) |
| Auth Routes | User Service → User Model | Write (register/login), Read (me) |
| Tool Routes | Tool Service → Tool Model | CRUD + upvotes |
| Rating Routes | Rating Service → Comment Model | CRUD + upvotes |
| Search Routes | Search Service → Tool Model | Read (text search, category filter) |
| Error Handler | All routes (catch-all) | Error response formatting |
