# Integrations

## External Services

### MongoDB Atlas
- **Type:** Database (cloud-hosted)
- **Connection:** `MONGO_URI` env var → `config/database.js`
- **Driver:** Mongoose `^9.3.1`
- **Used by:** All backend apps (users, tools, ratings, search)
- **Connection handling:** Graceful — logs error and continues in dev, exits in production

### Google OAuth 2.0
- **Type:** Authentication provider
- **Config:** `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` env vars
- **Callback:** `http://localhost:5000/auth/google/callback` (configurable via `GOOGLE_CALLBACK_URL`)
- **Implementation:** `middleware/passport.js` → `passport-google-oauth20` strategy
- **Flow:** Frontend redirects to `/auth/google` → Backend handles OAuth → Returns JWT tokens

## Internal API Communication

### Frontend → Backend API
- **Protocol:** HTTP REST
- **Base URL:** `NEXT_PUBLIC_API_URL` || `http://localhost:5000`
- **Auth:** Bearer token via `Authorization` header
- **Client:** Custom `fetchApi()` wrapper in `frontend/src/lib/api.ts`
- **Token storage:** `localStorage` (`accessToken`, `refreshToken`)

## DNS
- Custom DNS servers configured in `app.js`: `1.1.1.1` (Cloudflare), `8.8.8.8` (Google)
- Set via `dns.setServers()` at app startup

## No Other External Integrations
- No email service (no email verification yet)
- No file upload service
- No CDN configured
- No analytics or monitoring service
- No payment provider
