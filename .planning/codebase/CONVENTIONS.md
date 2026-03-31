# Conventions

## Code Style

### Backend (JavaScript/CommonJS)
- **Module system:** CommonJS (`require`/`module.exports`)
- **Async pattern:** `async/await` throughout
- **Error handling:** Custom error classes thrown → caught by centralized `errorHandler`
- **Route pattern:** `router.method(path, ...middleware, asyncHandler(async (req, res) => { ... }))`
- **No semicolons enforcement** — Mixed (most files use semicolons)
- **Line endings:** CRLF (Windows)

### Frontend (TypeScript/Next.js)
- **Module system:** ES Modules (`import`/`export`)
- **Component pattern:** Functional components with hooks
- **"use client"** directive on all interactive pages
- **Naming:** PascalCase for components, camelCase for functions/variables
- **Type definitions:** Centralized in `src/lib/types.ts`

## Error Handling Pattern

### Backend
```javascript
// Custom error hierarchy in libraries/errors.js
class AppError extends Error {
  constructor(message, statusCode, errorCode) { ... }
}
class ValidationError extends AppError { ... }  // 400
class AuthError extends AppError { ... }         // 401
class ForbiddenError extends AppError { ... }    // 403
class NotFoundError extends AppError { ... }     // 404
```

- Services throw custom errors → errorHandler middleware catches all
- errorHandler also handles Joi, Mongoose, and JWT native errors
- Development mode includes stack traces in responses

### Frontend
- `fetchApi` wrapper throws `Error` on non-ok responses
- Components use try/catch with `console.error` for logging
- Auth errors silently clear localStorage tokens

## API Response Format

All API responses follow a consistent envelope:

```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

## Service Pattern

```javascript
class ToolService {
  async createTool(toolData, userId) { ... }
  async getTools(filters, page, limit) { ... }
  // ...
}
module.exports = new ToolService(); // Singleton
```

- Each feature has one service class
- Services are exported as singleton instances
- Services handle business logic, not HTTP concerns
- Services call models directly (no repository pattern)

## Validation Pattern

- **Joi schemas** defined per-route in entry-point files
- Applied via `validate(schema)`, `validateQuery(schema)`, `validateParams(schema)` middleware
- Validation errors automatically caught by errorHandler

## Authentication Pattern

- JWT tokens: 15-minute access token + 7-day refresh token
- Frontend stores in `localStorage` (not cookies)
- `authenticateToken` middleware verifies JWT on protected routes
- `requireAuth` middleware ensures user is authenticated
- AuthContext provides `user`, `isAuthenticated`, `loginWithGoogle`, `logout`, `setTokensAndUser`

## Database Patterns

- **Soft deletes:** `isActive: false` instead of removing documents
- **Upvotes:** Embedded array in document (not separate collection)
- **Pagination:** `mongoose-paginate-v2` plugin
- **Text search:** MongoDB text indexes on `name` + `description`
- **Virtuals:** `commentCount` on Tool model (populated via `populate`)
