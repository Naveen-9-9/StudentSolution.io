# Requirements — Milestone v1.1: Premium UI & Color Identity

**Status**: Active
**Milestone**: v1.1

## v1.1 Requirements

### Color System
- [x] **COLOR-01**: App uses a distinctive brand palette with electric violet → cyan gradient accents replacing the plain indigo
- [x] **COLOR-02**: Each tool category has a unique accent hue (PDF=rose, PPT=amber, API=cyan, File=emerald, Productivity=violet, Education=blue, Other=slate)
- [x] **COLOR-03**: Dark mode uses a deep midnight base (#060612) with subtle colored ambient glows

### Components
- [x] **COMP-01**: ToolCard displays a category-tinted left border/glow accent matching its category color
- [x] **COMP-02**: ToolCard rating badge is visually prominent with filled-star styling and count
- [x] **COMP-03**: Upvote button has an animated micro-interaction on toggle (scale + color shift)
- [x] **COMP-04**: Category filter pills use their respective category colors with active state indication

### Layout & Hero
- [x] **HERO-01**: Homepage hero section uses an animated mesh gradient background with brand typography
- [x] **NAV-01**: Navigation bar has a frosted-glass blur with gradient brand wordmark on scroll

### Typography & Spacing
- [x] **TYPE-01**: Heading hierarchy uses a refined type scale with tighter tracking and bolder weights
- [x] **TYPE-02**: Consistent vertical rhythm and spacing tokens across all pages

### Polish
- [x] **POLISH-01**: Page transitions use subtle fade/slide animations between routes
- [x] **POLISH-02**: Loading skeletons match the actual component layout shapes

## v1.2 Requirements

### Identity Verification
- [x] **VERIFY-01**: System generates a unique, time-limited verification token upon user registration.
- [x] **VERIFY-02**: Users receive a premium-styled HTML email containing a secure activation link.
- [x] **VERIFY-03**: Verification landing page provides clear feedback (success/error/expired) and transitions to dashboard.

## Future Requirements

### Mobile & Responsiveness
- [ ] **MOBILE-01**: All pages are fully usable on 375px-wide mobile screens without horizontal scroll
- [ ] **MOBILE-02**: Navbar collapses to a hamburger menu on mobile with slide-out drawer navigation
- [ ] **MOBILE-03**: Search sidebar filters collapse into a toggleable mobile drawer

### Auth Recovery
- [ ] **AUTH-RECOVER-01**: Forgot-password flow sends a real email with a time-limited reset link
- [ ] **AUTH-RECOVER-02**: Google SSO is available as an account-recovery path for linked accounts

### Email
- [ ] **EMAIL-01**: Password reset email uses premium HTML template matching brand aesthetic

### Notifications
- [ ] **NOTIFY-01**: Real-time in-app notification bell shows unread counts and dropdown of recent events
- [ ] **NOTIFY-02**: Notifications trigger when tools user saved/upvoted get new reviews, or submitted tools are approved

### UI Polish
- [ ] **UI-POLISH-01**: No remaining hardcoded text-white / bg-white/5 contrast bugs in any theme

### Security Hardening
- [ ] **SEC-01**: All user inputs sanitized against NoSQL injection ($gt, $ne operators stripped)
- [ ] **SEC-02**: Stored user content (comments, bios, descriptions) stripped of XSS payloads (script tags, event handlers)
- [ ] **SEC-03**: Admin-only routes enforce requireAdmin middleware — non-admin users receive 403
- [ ] **SEC-04**: Refresh tokens are blacklisted on logout and checked before renewal
- [ ] **SEC-05**: Account locks after 5 consecutive failed login attempts for 15 minutes
- [ ] **SEC-06**: Google OAuth users can set a local password without requiring a current password

## Out of Scope

- Mobile native app — web-first
- Payment/monetization — free platform
- Complete redesign of backend API — no backend changes needed

## Traceability

| Requirement | Phase |
|-------------|-------|
| COLOR-01    | 03    |
| COLOR-02    | 03    |
| COLOR-03    | 03    |
| COMP-01     | 04    |
| COMP-02     | 04    |
| COMP-03     | 04    |
| COMP-04     | 04    |
| HERO-01     | 05    |
| NAV-01      | 05    |
| TYPE-01     | 03    |
| TYPE-02     | 03    |
| POLISH-01   | 05    |
| POLISH-02   | 05    |
| VERIFY-01   | 06    |
| VERIFY-02   | 06    |
| VERIFY-03   | 06    |
| MOBILE-01   | 09    |
| MOBILE-02   | 09    |
| MOBILE-03   | 09    |
| AUTH-RECOVER-01 | 09 |
| AUTH-RECOVER-02 | 09 |
| EMAIL-01    | 09    |
| NOTIFY-01   | 09    |
| NOTIFY-02   | 09    |
| UI-POLISH-01 | 09   |

