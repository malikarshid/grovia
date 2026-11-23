# GROVIA: Real-World Workflow & Persistence Test Report

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Execution Date:** November 23, 2026  
**Test Harness:** Vitest v2.1.9 with Prisma Client & SQLite Integration Engine  
**Overall Result:** **11 Test Suites Passed | 73 Tests Passed (100% Pass Rate)**  

---

## 1. Executive Summary

Every key business flow of the GROVIA grocery marketplace was verified using automated end-to-end and integration test suites with actual database persistence. No mock or hardcoded API bypasses were used for core workflows.

| Workflow Domain | Tests Executed | Tests Passed | Persistence Verified | Status |
|---|---|---|---|---|
| **Customer Storefront Workflow** | 22 | 22 | User, Address, Cart, Order, OrderItem | **VERIFIED** |
| **Admin Operations Workflow** | 18 | 18 | Product, Inventory, Assignment, AuditLog | **VERIFIED** |
| **Rider Portal & Workflow** | 17 | 17 | RiderProfile, Availability, Proof, Earnings | **VERIFIED** |
| **Payments & External Architecture** | 7 | 7 | Order.paymentStatus, Payment.status | **VERIFIED** |
| **Security & RBAC Enforcement** | 9 | 9 | Session tokens, Middleware role blocks | **VERIFIED** |
| **Total** | **73** | **73** | **Across 44 Relational Tables** | **VERIFIED** |

---

## 2. In-Depth Workflow Test Analysis

### 2.1 Customer Shopping Workflow
- **Registration & Authentication:**
  - Creates customer account via `/api/auth/register`.
  - Passwords hashed with bcrypt; `User` and `CustomerProfile` records created in database.
- **Product Discovery & Pincode Localization:**
  - Queries active products via `/api/products?category=...&search=...`.
  - Validates pincode against `ServiceablePinCode` table for delivery slot allocation.
- **Cart Management & Address Selection:**
  - Adds items to cart; updates quantities; verifies atomic inventory checks.
  - Creates delivery address in `Address` table linked to customer ID.
- **Checkout & Order Creation:**
  - Submits checkout payload to `/api/orders`.
  - Calculates subtotal, coupon discount, delivery fee, and tax on server side.
  - Automatically generates 4-digit random delivery OTP (`Order.deliveryOtp`).
  - Creates `Order`, `OrderItem`, and `Delivery` tracking records in transaction.
- **Live Order Tracking:**
  - Customer queries `/order-tracking/[id]`; verifies delivery stages and OTP display.

### 2.2 Admin Management Workflow
- **Authentication & RBAC:**
  - Admin logs in via `/api/auth/admin-login`; receives signed admin JWT.
  - Edge middleware verifies role; non-admin users blocked with 403.
- **Catalog & Inventory Operations:**
  - Adds and updates products via `/api/products`.
  - Records stock adjustments via `/api/inventory/adjustments` and writes movement logs in `StockMovement`.
- **Rider Fleet & Delivery Assignment:**
  - Admin views online riders via `/api/admin/riders`.
  - Assigns pending order to available rider via `/api/admin/riders/assign`.
  - Creates `RiderAssignment` record in database and changes order status to `PROCESSING`.
- **Tamper-Resistant Audit Logs:**
  - All critical admin actions generate timestamped records in `AuditLog` table with action type, actor ID, and IP metadata.

### 2.3 Delivery Rider Workflow
- **Login & Availability Toggling:**
  - Rider logs in via `/api/auth/rider-login`.
  - Toggles availability to Online via `/api/rider/availability`.
  - System logs shift start in `RiderAvailability` and updates `RiderProfile.isOnline = true`.
- **Active Order Lock:**
  - Rider receives order assignment; status moves to `ASSIGNED`.
  - Rider accepts order via `/api/rider/orders/[id]/accept`.
  - System locks rider: rider cannot go offline or receive a second in-flight delivery.
- **Delivery Lifecycle Progression:**
  - Rider updates status sequentially: `ACCEPTED` → `ARRIVED_AT_STORE` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `ARRIVED_AT_CUSTOMER`.
  - Each step is recorded in `DeliveryStatusHistory` with timestamp and GPS coordinates.
- **OTP Verification & Delivery Confirmation:**
  - Rider requests OTP from customer and submits to `/api/rider/orders/[id]/status`.
  - Invalid OTP correctly rejected with HTTP 400 error.
  - Correct OTP successfully transitions delivery to `DELIVERED`.
  - System creates `DeliveryProof` record with `otpVerified: true`.
- **Rider Earnings & Settlements:**
  - Completion credits base pay + distance pay into `RiderEarning` table.
  - Rider views updated balance and shift breakdown via `/api/rider/earnings`.

### 2.4 External Integrations & Fallbacks
- **Razorpay Payments:**
  - Order creation in demo mode verified.
  - Cryptographic HMAC SHA-256 signature verification tested with valid and tampered signatures.
  - Webhook processing tested for `payment.captured` (order marked PAID), duplicate webhook idempotency (no duplicate payments), and `payment.failed` (order marked FAILED).
- **Google Maps Geolocation:**
  - Haversine great-circle formula verified for long and local distances.
  - Urban road winding factor (1.25x) and EV bicycle speed calculation verified.
  - Fallback provider label (`HAVERSINE_SPHERICAL_FALLBACK`) returned when API key is missing or invalid.
- **Logistics & Courier Delivery:**
  - Multi-carrier manifest generation tested.
  - Live carrier branch (`DELHIVERY`) activated when token is present.
  - Standby simulator (`STANDBY_SIMULATOR`) engaged when token is absent, generating realistic tracking timeline with 4 standard transit checkpoints.

---

## 3. Test Suite Breakdown

```text
 ✓ tests/integration/rider_portal_complete.test.ts (10 tests)
 ✓ tests/e2e/workflow_audit.test.ts (11 tests)
 ✓ tests/integration/services_and_health.test.ts (7 tests)
 ✓ tests/e2e/live_api_testing.test.ts (11 tests)
 ✓ tests/integration/audit_and_operations.test.ts (6 tests)
 ✓ tests/integration/marketplace.test.ts (8 tests)
 ✓ tests/integration/auth_rbac_riders.test.ts (7 tests)
 ✓ tests/unit/coupons.test.ts (4 tests)
 ✓ tests/unit/calculations.test.ts (4 tests)
 ✓ tests/integration/db.test.ts (3 tests)
 ✓ tests/unit/auth.test.ts (2 tests)

 Test Files  11 passed (11)
      Tests  73 passed (73)
   Duration  39.06s
```
