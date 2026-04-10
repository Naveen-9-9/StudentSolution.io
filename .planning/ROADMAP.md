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
