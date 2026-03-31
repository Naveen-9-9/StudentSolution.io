# Concerns

## Security Issues

### 🔴 Critical: Secrets in `.env` committed to git
- `.env` file contains real MongoDB credentials, Google OAuth secrets, and JWT secret
- These should be in `.gitignore` and never committed
- **Impact:** Anyone with repo access has database and OAuth credentials
- **Fix:** Rotate all secrets, add `.env` to `.gitignore`, use `.env.example` template

### 🟡 JWT stored in localStorage
- Access tokens stored in `localStorage` are vulnerable to XSS attacks
- Consider `httpOnly` cookies for token storage
- Current 15m access token TTL mitigates risk somewhat

### 🟡 No token refresh implementation on frontend
- Backend has `/auth/refresh` endpoint
- Frontend `AuthContext` has no automatic token refresh logic
- When access token expires, user gets logged out silently
- Known issue from previous conversation (token expiration errors)

## Technical Debt

### Admin role not implemented
- `middleware/roles.js` exists with role checks
- Multiple TODOs in `toolService.js`: `// TODO: Check if user is admin`
- Owner-only operations have no admin override

### Frontend metadata not customized
- `layout.tsx` still has "Create Next App" title and description
- SEO metadata not configured for the actual application

### Hardcoded categories
- Tool categories are hardcoded in multiple places:
  - `toolModel.js` schema enum
  - `tools.js` route validation
  - Frontend references
- Should be centralized or database-driven

### Duplicate passport initialization
- `app.js` requires passport twice:
  - Line 7: `const passport = require('./middleware/passport');`
  - Line 27: `require('./middleware/passport');`

### No input sanitization
- While Joi validates input, there's no HTML/XSS sanitization on user-submitted content (tool descriptions, comments)

## Performance Concerns

### Upvotes as embedded array
- Each tool stores all upvotes as an embedded array
- As upvote count grows, the entire upvote array is loaded and modified
- Could become expensive for popular tools
- Consider a separate `Upvote` collection for scalability

### No caching layer
- Every request hits MongoDB directly
- No Redis or in-memory cache for popular tools or categories
- Search results not cached

### Frontend re-fetches on every navigation
- No client-side data caching (no SWR, React Query, or similar)
- Each page load triggers fresh API calls
- Category data fetched on every home page visit

## Fragile Areas

### Auth state management
- `useRef(hasInitialized)` prevents double-init in React strict mode
- But if the API call fails during init, the user stays logged out with no retry logic
- No error state exposed to the UI

### Error messages in production
- `errorHandler.js` only shows `err.message` for unclassified errors in dev mode
- In production, unknown errors become generic "Server Error" — good for security but hard to debug

### Search depends on text index
- MongoDB text search is basic (no fuzzy matching, no typo tolerance)
- Text index on `name`+`description` only
- Tags are searched separately via `$in` operator

## Missing Features (referenced but not implemented)

- Email verification for registered users
- Password reset flow
- User profile editing
- Tool submission workflow (approval/moderation)
- Notification system
- File uploads (tool screenshots/logos)
