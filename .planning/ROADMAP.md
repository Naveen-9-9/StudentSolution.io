# Roadmap — Milestone v1.1 (COMPLETE)

## Overview

**Milestone:** v1.1
**Phases:** 03–05 (continuing from v1.0)
**Goal:** Distinctive visual identity through bold colors, unique components, and polished motion.

---

## ✓ Phase 03: Design System & Color Foundation

**Goal:** Establish the new color palette, category color tokens, and typography scale as CSS custom properties.

**Requirements:** COLOR-01, COLOR-02, COLOR-03, TYPE-01, TYPE-02

**Deliverables:**
- Update `globals.css` with new brand palette (electric violet → cyan gradient primary)
- Define 7 category color tokens as CSS custom properties
- Deepen dark mode base to `#060612` with ambient glow system
- Refine typography scale (heading weights, tracking, line-height)
- Update spacing tokens for consistent vertical rhythm

**Success Criteria:**
1. All pages render with the new color palette — no plain indigo remnants
2. Category colors are accessible via CSS variables (e.g., `--category-pdf`)
3. Dark mode background is visibly deeper and richer than before
4. Typography hierarchy is visually distinct (h1 vs h2 vs body)

---

## ✓ Phase 04: Component Redesign

**Goal:** Apply the new design system to ToolCard, category pills, and interactive elements.

**Requirements:** COMP-01, COMP-02, COMP-03, COMP-04

**Deliverables:**
- ToolCard: category-tinted left border/glow, prominent rating badge
- Upvote button: animated scale + color shift on toggle
- Category filter pills: colored by category with active state
- Update search page and leaderboard to use new component styles

**Success Criteria:**
1. Each ToolCard shows a colored accent matching its category
2. Rating badge is immediately visible with filled-star styling
3. Upvote button animates on click (not just color change)
4. Category pills are color-coded and clearly show active selection

---

## ✓ Phase 05: Hero, Navigation & Polish

**Goal:** Complete the visual transformation with hero section, nav refinement, and page transitions.

**Requirements:** HERO-01, NAV-01, POLISH-01, POLISH-02

**Deliverables:**
- Homepage hero: animated gradient mesh with brand heading
- Navigation: frosted-glass blur effect, gradient wordmark
- Page transitions: subtle fade/slide between routes
- Loading skeletons: match actual component shapes
- Auth pages: deepen gradients with new palette

**Success Criteria:**
1. Hero section immediately feels cinematic and distinctive
2. Nav blur is visible on scroll with smooth transition
3. Route changes have visible but non-jarring animation
4. Skeleton loaders match the shape of their target components

---

# Roadmap — Milestone v1.2: Engagement & Identity

## Overview

**Milestone:** v1.2
**Phases:** 06–08
**Goal:** Strengthen the community layer with verified identities and personal curation hubs.

### Phase 1: Add system reviews, upvotes, tool info modal, fix errors, add tools, create user dashboard for saved tools, fix saving system

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 0 plans

Plans:
- [ ] TBD (run  to break down)

### Phase 1: Fix issues: nav tracking, bookmark empty state, missing search bar, modern sort dropdown, email verify for submission, trending logic, pagination bug

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 1 to break down)

### Phase 07: Profile Menu & User Dashboard Navigation

**Goal:** now add a profile menu on the top right side and move the submiit menu to the that and add the user dashboard in it where he can acces hes dashboard
**Requirements**: TBD
**Depends on:** Phase 06
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 7 to break down)


### Phase 1: Profile Settings & Theming: Implement settings page with theme switching and account management

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 1 to break down)

---

## Phase 06: Email Verification & User Onboarding

**Goal:** Implement a secure email verification loop to ensure community quality and account security.

**Requirements:** VERIFY-01, VERIFY-02, VERIFY-03

**Deliverables:**
- Backend: Update `User` model with verification fields.
- Backend: Verification routes (`/auth/verify`, `/auth/resend`).
- Backend: Email service integration (Nodemailer).
- Frontend: "Verify Identity" landing page.
- Frontend: "Check Link" state in Registration flow.

**Success Criteria:**
1. New users receive a verification link immediately after signup.
2. Users cannot access restricted features (e.g., Tool Submission) until verified.
3. Verification link correctly activates the account in the database.
4. Resend verification button works for expired/lost links.
---

## Phase 08: Critical UI Fixes & Light Mode Polish

**Goal:** Resolve immediate visibility blockers in the Light theme and ensure the home page accurately reflects all tool categories.

**Requirements:** UI-FIX-01, THEME-POLISH-01, THEME-POLISH-02

**Deliverables:**
- Fix "AI" category visibility on Home Page (ranking/rendering logic).
- Audit and fix invisible "Stars" in Light Mode (ReviewForm & ToolCard).
- Fix invisible Content/Text in Login & Register pages for Light Mode.
- Global audit of `text-white` hardcoding vs theme-aware `text-foreground`.

**Success Criteria:**
1. "AI" toolkit is visible on the home page category list.
2. Rating stars are clearly visible on white backgrounds.
3. Login and Register forms are fully legible in the "Technical White" theme.
4. No hardcoded white text remains in primary auth pathways.

---

## Phase 09: Mobile Responsiveness, Auth Recovery & Real-Time Notifications

**Goal:** Make the platform fully usable on mobile devices, resolve remaining UI polish issues, implement a forgot-password / account-recovery flow with real email delivery, and add real-time in-app notifications when content the user cares about is updated.

**Requirements:** MOBILE-01, MOBILE-02, MOBILE-03, AUTH-RECOVER-01, AUTH-RECOVER-02, EMAIL-01, NOTIFY-01, NOTIFY-02, UI-POLISH-01

**Depends on:** Phase 08

**Plans:** 4 plans (2 waves)

Plans:
- [x] 09-01 Mobile Responsive Layouts (Wave 1)
- [x] 09-02 Forgot Password & Account Recovery (Wave 1)
- [x] 09-03 Real-Time Notification System (Wave 2)
- [x] 09-04 UI Polish & Theme Fixes (Wave 2)

**Deliverables:**
- Mobile-first responsive layouts for Home, Search, Auth, and Settings pages.
- Audit and fix all remaining Light-mode and cross-theme UI inconsistencies.
- Forgot Password flow: frontend form, backend token generation + email (Nodemailer), reset page.
- Account Recovery: allow SSO Google fallback when password is unknown.
- Real email notifications (Nodemailer): welcome email on signup, password-reset email.
- Real-time in-app notification bell: SSE/polling based — alerts user when a tool they've upvoted or saved receives a new review, or when a tool is approved.

**Success Criteria:**
1. All pages are usable on 375px-wide mobile screens without horizontal scroll.
2. Forgot-password flow sends a real email and allows the user to set a new password.
3. Google SSO is available as an account-recovery path.
4. A notification bell icon in the navbar shows unread counts and a dropdown of recent events.
5. No remaining hardcoded `text-white` / `bg-white/5` contrast bugs in any theme.

---

## Phase 10: Security Hardening

**Goal:** Lock down backend against NoSQL injection, XSS, broken admin access control, token theft, and account brute-forcing. No hacker gets in.

**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06

**Depends on:** Phase 09

**Plans:** 5 plans (3 waves)

Plans:
- [x] 10-01 NoSQL Injection & XSS Protection (Wave 1)
- [x] 10-02 Admin Access Control Fix (Wave 1)
- [x] 10-03 JWT Token Hardening & Blacklisting (Wave 2)
- [x] 10-04 Account Lockout & Google Password Fix (Wave 2)
- [x] 10-05 Secure Token Transport & Log Redaction (Wave 3)

**Deliverables:**
- Add `express-mongo-sanitize` and `hpp` middleware to block injection attacks.
- Custom XSS sanitizer middleware stripping dangerous HTML from all user inputs.
- Enforce `requireAdmin` on all admin-only routes.
- Separate JWT secrets for access vs refresh tokens with `jti` tracking.
- In-memory refresh token blacklist with TTL cleanup on logout.
- Account lockout after 5 failed login attempts (15-min cooldown).
- Allow Google OAuth users to set a local password without requiring current password.
- Redact tokens from morgan access logs.
- Add `hasPassword` flag to `/auth/me` response.

**Success Criteria:**
1. NoSQL injection payloads (`{"$gt":""}`) are rejected at middleware level.
2. HTML/script tags are stripped from all stored user content.
3. Non-admin users receive 403 on `/tools/pending` and `/tools/:id/status`.
4. Logout invalidates refresh token — reuse returns 401.
5. Account locks after 5 failed logins, unlocks after 15 minutes.
6. Google OAuth users can set a password from Settings without "current password".

---

## Phase 11 & 12: Community Profiles & Contribution Transparency

**Goal:** Create a space for users to showcase their identity and contributions, allowing the community to discover high-quality contributors through public profiles.

**Requirements:** PROFILE-01, PROFILE-02

**Depends on:** Phase 10

**Deliverables:**
- Backend: `GET /users/:id/profile` returning public user data, stats, and submitted tools.
- Frontend: Public Profile Page `/profile/[id]` showcasing bio, impact score, and contribution grid.
- System: Real-time notification updates for tool approvals and upvotes (completed).

**Success Criteria:**
1. Users can visit `/profile/[id]` and view another user's approved tool submissions.
2. Clicking a tool in a user's profile redirects to the Discover page with a highlight effect.
3. User impact score correctly reflects their contributions and community engagement.
