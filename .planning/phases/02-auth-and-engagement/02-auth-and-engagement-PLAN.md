# Phase 02: Auth & Engagement Fixes

## 1. Goal
Address critical stability issues in the authentication flow and database connection, and enhance the user engagement system by making upvotes persistent and seeding realistic rating/review data.

## 2. Approach

### 2.1 Backend Stability
- **MongoDB Connection**: Simplify the connection URI and options in `config/database.js` to mitigate "SSL Alert 80" errors on MongoDB Atlas SRV connections.
- **Fail-Fast Configuration**: Disable Mongoose command buffering (`bufferCommands: false`) so the backend throws an error immediately on connection failure rather than hanging indefinitely.

### 2.2 Frontend Stability
- **Auth Context Optimization**: Memoize the `AuthContext` provider value (`useMemo`) and its internal functions (`useCallback` for `setTokensAndUser`, `logout`, `loginWithGoogle`) to prevent unnecessary child re-renders.
- **Auth Success Guard**: Add a `useRef` guard in the authentication success page to block duplicate `/auth/me` calls from executing simultaneously, preventing an infinite API loop.

### 2.3 Engagement Features
- **Upvote Persistence**: Update backend tool querying endpoints (`getTools`, `getToolById`, `getTrendingTools`) to cross-reference the user's ID against the tool's upvote array, attaching a boolean `hasUpvoted` field to the response.
- **Visual Feedback**: Modify the frontend `ToolCard` and Tool Details page to consume the `hasUpvoted` field, applying a distinct visual style (filled icon, modified colors) to clearly show when a user has already upvoted a tool.
- **Data Seeding**: Enhance the `seed.js` script to generate 2-5 random reviews and ratings per tool, ensuring the database starts with realistic engagement data and populates average ratings correctly.

## 3. Assumptions
- The "SSL Alert 80" error is primarily caused by overly strict TLS settings enforced by outdated Node.js versions or restrictive network environments when connecting to MongoDB Atlas. Simplifying the driver config is the best universal solution.
- The infinite loop on the frontend is solely caused by React's context re-triggering the effect hook in `AuthSuccessPage`.

## 4. Risks & Mitigations
- **Risk**: Stripping TLS options from the connection string causes failures on strict production environments.
  - **Mitigation**: Rely on the official MongoDB Node.js driver's default secure settings for `mongodb+srv://` schemas.
- **Risk**: Upvote payload significantly impacts list view API performance.
  - **Mitigation**: Calculate `hasUpvoted` server-side and delete the full `upvotes` array before returning the payload to the client.
