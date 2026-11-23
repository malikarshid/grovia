# GROVIA COMPLETION PLAN
## Comprehensive Backend, Security, Admin, Rider Portal & Responsive Application Plan
### Fresh Living. Smarter Shopping.

**Date:** November 22, 2026  
**Project Workspace:** `C:\Project\Grovia`  
**Current Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5.6, Prisma 5.22, SQLite (Local Dev) / PostgreSQL (Production), Tailwind CSS, Lucide, Recharts, Framer Motion, Zustand, Vitest  

---

## 1. PROJECT AUDIT FINDINGS

### A. Security & Authorization Deficiencies Identified
1. **Missing Global Middleware:** There is currently no `middleware.ts` file in the project. The `/admin/*` routes rely solely on client-side state, leaving them vulnerable to direct URL navigation without server-side validation.
2. **Exposed Administrative Links in Customer UI:** Customer navigation components (`CustomerHeader.tsx`, `CustomerFooter.tsx`) prominently display "Admin Portal" and "Admin & Staff Dashboard" links in top banners, footers, and mobile drawers.
3. **Missing Authentication Guard on Admin Layout:** `src/app/admin/layout.tsx` renders admin navigation and pages unconditionally without verifying an active session or admin role.
4. **Missing Dedicated Rider Experience:** No rider routes (`/rider/*`) or rider authorization models currently exist. Delivery assignments are handled through generic models without a dedicated driver mobile app.
5. **Credentials Management:** Default credentials (`admin_me` / `9682pw` and `rider_me` / `Rider@9682pw`) must be injected into `.env` and seeded securely with password rotation requirements on first login.

### B. Database Schema Requirements
1. **User Model Enhancements:** Add `username`, `mustChangePassword`, `isSuspended`, `failedLoginAttempts`, `lockoutUntil`, `lastLoginAt`, and `googleId` (for future Google OAuth).
2. **Rider Domain Models:** Add `RiderProfile`, `RiderAvailability`, `RiderAssignment`, `RiderEarning`, `RiderSettlement`, `DeliveryStatusHistory`, `DeliveryProof`, and `DeliveryRoute`.
3. **Transaction Safety:** Enforce transactional state changes for order assignment, status transitions, OTP verification, and delivery completion.

---

## 2. SYSTEM ARCHITECTURE & 3 DISTINCT EXPERIENCES

```
+---------------------------------------------------------------------------------+
|                               GROVIA PLATFORM                                   |
+------------------------+--------------------------------+-----------------------+
|  1. CUSTOMER STORE     |  2. PRIVATE ADMIN PORTAL       |  3. RIDER MOBILE APP  |
|  (Public Storefront)   |  (RBAC Protected)              |  (Field Operations)   |
|  - /                   |  - /admin/login (Private)      |  - /rider/login       |
|  - /products           |  - /admin (Dashboard)          |  - /rider/dashboard   |
|  - /product/[slug]     |  - /admin/orders               |  - /rider/orders      |
|  - /categories         |  - /admin/inventory            |  - /rider/orders/[id] |
|  - /cart & /checkout   |  - /admin/riders               |  - /rider/navigation  |
|  - /orders             |  - /admin/rider-assignments    |  - /rider/earnings    |
|  - /order-tracking/[id]|  - /admin/pricing-rules        |  - /rider/profile     |
|  - /profile            |  - /admin/serviceability       |  - /rider/availability|
|  (Zero Admin Links)    |  - /admin/audit-logs           |  - /rider/support     |
+------------------------+--------------------------------+-----------------------+
|                       Next.js Middleware (RBAC Guard)                           |
+---------------------------------------------------------------------------------+
|                    Centralized Backend APIs & Auth Service                      |
+---------------------------------------------------------------------------------+
|                    Prisma ORM & SQLite / PostgreSQL Engine                      |
+---------------------------------------------------------------------------------+
```

---

## 3. IMPLEMENTATION PHASES & STEP-BY-STEP ROADMAP

### Phase 1: Environment & Credential Configuration
- Update `.env` with:
  - `ADMIN_LOGIN_ID=admin_me`
  - `ADMIN_INITIAL_PASSWORD=9682pw`
  - `RIDER_LOGIN_ID=rider_me`
  - `RIDER_INITIAL_PASSWORD=Rider@9682pw`
  - Google OAuth stubs (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`).
- Add environment validation preventing production startup with default passwords.

### Phase 2: Database Schema & Migration Expansion
- Extend `prisma/schema.prisma` with:
  - User fields (`username`, `mustChangePassword`, `isSuspended`, `failedLoginAttempts`, `lockoutUntil`, `googleId`).
  - Rider models (`RiderProfile`, `RiderAvailability`, `RiderAssignment`, `RiderEarning`, `RiderSettlement`).
  - Delivery models (`DeliveryStatusHistory`, `DeliveryProof`, `DeliveryRoute`).
- Run `npx prisma db push && npx prisma generate`.
- Update seed scripts to provision `admin_me` (Super Admin) and `rider_me` (Rider) with initial credentials and `mustChangePassword: true`.

### Phase 3: Centralized Security, Auth Service & Middleware
- Create `src/middleware.ts`:
  - Protects `/admin/:path*` (allows `/admin/login`, verifies `ADMIN`/`SUPER_ADMIN`/manager roles).
  - Protects `/rider/:path*` (allows `/rider/login`, verifies `RIDER` role).
  - Redirects unauthorized users to their respective login portals.
- Update `src/lib/auth.ts`:
  - Add rate limiting logic with memory/database tracking.
  - Add permission check helper `hasPermission(role, permission)`.
  - Add `verifyAdminSession` and `verifyRiderSession`.
- Create auth endpoints:
  - `POST /api/auth/admin-login` (handles username/email, validates password, checks lockout, enforces password change).
  - `POST /api/auth/rider-login` (handles username/email, validates RIDER role, checks suspension).
  - `POST /api/auth/change-password` (updates password, clears `mustChangePassword` flag).

### Phase 4: Purge Admin Access from Customer Storefront
- Remove all `/admin` links from `src/components/navigation/CustomerHeader.tsx` (top banner, dropdown, mobile menu).
- Remove `/admin` links from `src/components/navigation/CustomerFooter.tsx`.
- Update `CustomerBottomNav.tsx` to hide completely on both `/admin` and `/rider` paths.
- Audit customer pages ensuring zero administrative leakage.

### Phase 5: Dedicated Rider Portal Implementation
- Create mobile-first rider layout `src/app/rider/layout.tsx` (high-contrast, touch-first bottom navigation).
- Create `/rider/login/page.tsx` (mobile-optimized PIN/password login).
- Create `/rider/dashboard/page.tsx` (online/offline toggle, today's KPIs, earnings summary, quick dispatch alert).
- Create `/rider/orders/page.tsx` (active, pending, and completed delivery cards).
- Create `/rider/orders/[id]/page.tsx` (order details, customer directions, stage buttons: Accept, Arrived at Store, Picked Up, Out for Delivery, Arrived, Complete Delivery with 4-digit OTP / signature proof).
- Create `/rider/navigation/page.tsx` (Google Maps route visualization with live GPS coordinates, turn-by-turn fallback).
- Create `/rider/earnings/page.tsx` (trip earnings, incentives, settlement history).
- Create `/rider/profile/page.tsx` (driver rating, vehicle registration, password change).
- Create `/rider/availability/page.tsx` (duty schedule, online hours log).
- Create `/rider/support/page.tsx` (emergency rider SOS, dark store manager call, issue resolution).

### Phase 6: Customer Order Tracking Experience
- Create `/order-tracking/[id]/page.tsx` and route `/order-tracking/[id]` for customers:
  - 7-step visual order milestone (Confirmed -> Processing -> Packed -> Rider Assigned -> Picked Up -> Out for Delivery -> Delivered).
  - Delivery partner card with vehicle type, driver rating, and masked contact.
  - Live GPS tracking map showing dark store, driver location, and doorstep ETA.

### Phase 7: Admin Rider Management Modules
- Create `/admin/riders/page.tsx` (manage delivery partners, ratings, vehicle details, active/suspended switch).
- Create `/admin/rider-assignments/page.tsx` (manual & automated order dispatch matrix).
- Create `/admin/rider-performance/page.tsx` (on-time delivery rates, average transit times).
- Create `/admin/rider-earnings/page.tsx` (payout rule configuration, pending settlements).
- Create `/admin/login/page.tsx` (dedicated private administration portal login).

### Phase 8: Testing, Verification & Final Documentation
- Write comprehensive Vitest tests in `tests/integration/auth_rbac.test.ts` and `tests/integration/rider_workflow.test.ts`.
- Run `npx tsc --noEmit`, `npm test`, and `npm run build`.
- Generate exhaustive documentation files:
  - `README.md`
  - `ARCHITECTURE.md`
  - `API_DOCUMENTATION.md`
  - `DATABASE_DOCUMENTATION.md`
  - `SECURITY_AUDIT.md`
  - `RIDER_PORTAL_GUIDE.md`
  - `ADMIN_GUIDE.md`
  - `DEPLOYMENT_GUIDE.md`
  - `TEST_REPORT.md`
  - `PROJECT_PROGRESS.md`
  - `GROVIA_COMPLETION_REPORT.md`

---

## 4. EXECUTION PROGRESS STATUS (ALL PHASES VERIFIED)

- [x] **Phase 1: Environment & Credential Configuration** — Completed (`ADMIN_LOGIN_ID`, `RIDER_LOGIN_ID`, OAuth placeholders configured).
- [x] **Phase 2: Database Schema & Seed Expansion** — Completed (Prisma client generated, seeded admin_me, rider_me, and dark store relations).
- [x] **Phase 3: Customer Application Sanitization & Live Tracking** — Completed (Purged admin links, built `/order-tracking/[id]`).
- [x] **Phase 4: Server-Side Security, Edge Middleware & Auth Endpoints** — Completed (Built `src/middleware.ts`, admin-login, rider-login, change-password).
- [x] **Phase 5: Dedicated Delivery Rider Portal** — Completed (All 10 routes: `/rider`, `/rider/login`, `/rider/dashboard`, `/rider/orders`, `/rider/orders/[id]`, `/rider/navigation`, `/rider/earnings`, `/rider/profile`, `/rider/availability`, `/rider/support`).
- [x] **Phase 6: Private Administration Portal Upgrades & Audit Logs** — Completed (Built `/admin/riders`, `/admin/rider-assignments`, `/admin/rider-performance`, `/admin/rider-earnings`, `/admin/audit-logs`, `/admin/fulfilment`, and client-side auth guard).
- [x] **Phase 7: Product Image Repair & Database Fix** — Completed (All 4 broken Unsplash IDs fixed in code, seed, and live DB).
- [x] **Phase 8: Automated Testing, Build & Production Verification** — Completed (43/43 tests passing across 8 suites, 94/94 Next.js routes built).
