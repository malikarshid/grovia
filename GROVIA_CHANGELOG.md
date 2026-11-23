# GROVIA: Project Changelog

All notable changes to the GROVIA grocery marketplace platform are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to Semantic Versioning.

---

## [1.0.0-staging] - 2026-11-23

### Added
- **Staging Readiness Documentation:**
  - `GROVIA_STAGING_DEPLOYMENT_REPORT.md` with infrastructure architecture, smoke test checklist, and rollback procedures.
  - `GROVIA_DATABASE_SETUP.md` with PostgreSQL provisioning, connection pooling, and migration execution steps.
  - `GROVIA_ENVIRONMENT_VARIABLES.md` with twelve-factor runtime variable specification and template.
  - `GROVIA_REAL_WORKFLOW_TEST_REPORT.md` detailing 73 automated tests with actual database persistence.
  - `GROVIA_SECURITY_REVIEW.md` covering password hashing, RBAC, session security, and OTP verification.
- **Webhook Idempotency & Failure Handling:**
  - Added duplicate webhook idempotency in `src/app/api/payment/webhook/route.ts` via `@unique` `transactionId`.
  - Added `payment.failed` event handling to update `Order.paymentStatus = 'FAILED'` and ledger entry.
- **Expanded Integration Tests:**
  - Added 3 new test cases in `tests/integration/services_and_health.test.ts` (webhook idempotency, failed event processing, Maps fallback on invalid keys, and carrier provider credential inspection), increasing total passing tests to 73 across 11 test files.

## [1.0.0-rc1] - 2026-11-23

### Added
- **Core External Service Abstractions:**
  - `PaymentService` (`src/services/paymentService.ts`) with dual-mode Razorpay checkout, timing-safe HMAC SHA-256 signatures, and demo standby engine.
  - `MapsService` (`src/services/mapsService.ts`) with Google Maps Distance Matrix API and spherical Haversine formula with a 1.25 urban winding factor.
  - `CourierService` (`src/services/courierService.ts`) with Delhivery Express and Shiprocket adapters alongside a 4-stage tracking timeline simulator.
- **Production Health & Diagnostics:**
  - Added `/api/health` checking database latency, memory footprint, uptime, environment, and subsystem status without leaking secrets.
  - Added `/api/location/distance` and `/api/logistics/track/[awb]`.
  - Added `/api/payment/razorpay/order`, `/api/payment/razorpay/verify`, and `/api/payment/webhook`.
- **PostgreSQL Database Engine Migration:**
  - Generated `prisma/schema.postgresql.prisma` and compiled ANSI SQL DDL migration `prisma/migrations/0_init_postgresql/migration.sql` (1,152 lines, 44 tables, 37 indexes).
  - Added synchronization script `scripts/sync_pg_schema.js`.
- **Rider Portal Enhancements:**
  - Added persistent Online/Offline availability toggle with shift logging in `RiderAvailability`.
  - Added single active delivery lock preventing riders from taking multiple in-flight orders or going offline during delivery.
  - Added cryptographically random 4-digit OTP verification during doorstep delivery handshake.

## [1.0.0-beta] - 2026-11-23

### Added
- **Initial Grocery Marketplace Release:**
  - Next.js 14 App Router full-stack architecture with 100 static and dynamic routes.
  - Customer shopping storefront (Home, Catalog, Product details, Cart, Checkout, Order tracking).
  - Private administration portal with 18 management screens (Catalog, Inventory, Orders, Riders, Audit logs, Reports).
  - Dedicated delivery rider portal (Dashboard, Availability, Orders, Earnings, Navigation).
  - Dual theme engine (Classic Green, Slate Dark, Eye-protection Warm Amber).
  - SQLite development database schema with 44 relational models and seed data.
  - Edge Middleware (`src/middleware.ts`) enforcing role-based access control.
  - Comprehensive automated test harness with 10 test suites.
