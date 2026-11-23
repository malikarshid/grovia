# GROVIA Verification & Test Report
## Fresh Living. Smarter Shopping.

### Test Execution Summary
- **Test Framework:** Vitest v2.1.9 with JSDOM
- **Test Suites Executed:** 9 Passed (9 Total)
- **Tests Executed:** 54 Passed (54 Total)
- **Failures / Errors:** 0
- **Pass Rate:** 100%
- **Execution Time:** ~3.54 seconds

---

### Executed Test Suites & Detailed Test Breakdown

#### 1. Live API Endpoints & Role-Based Access Testing (`tests/e2e/live_api_testing.test.ts`)
- `authenticates admin_me with 9682pw and issues an HTTP-only grovia_session cookie`: **PASSED**
- `authenticates rider_me with Rider@9682pw and issues a rider session cookie`: **PASSED**
- `rejects unauthenticated requests to protected admin reports with 403`: **PASSED**
- `rejects unauthenticated requests to rider dashboard with 401`: **PASSED**
- `rejects rider sessions attempting to access admin sales reports with 403`: **PASSED**
- `allows authenticated admin to fetch live sales report from real database`: **PASSED**
- `allows authenticated admin to fetch order sources and channel breakdown`: **PASSED**
- `allows authenticated admin to fetch inventory levels and stock summaries`: **PASSED**
- `allows authenticated admin to fetch deliveries and driver assignments`: **PASSED**
- `allows authenticated rider to fetch rider dashboard with active assignments`: **PASSED**
- `allows authenticated admin to query audit logs`: **PASSED**

#### 2. Financial & Monetary Calculations (`tests/unit/calculations.test.ts`)
- `calculates discount percentage correctly`: **PASSED**
- `formats Indian Rupee currency correctly`: **PASSED**
- `calculates order totals below free delivery threshold`: **PASSED**
- `waives delivery fee when subtotal exceeds free delivery threshold (₹499)`: **PASSED**

#### 3. Coupon Validation Logic (`tests/unit/coupons.test.ts`)
- `validates a valid coupon with qualifying subtotal`: **PASSED**
- `rejects coupon when order subtotal is below minimum threshold`: **PASSED**
- `rejects coupon when usage limit is reached`: **PASSED**
- `rejects expired coupons`: **PASSED**

#### 4. Core Authentication & RBAC Security (`tests/unit/auth.test.ts`)
- `correctly recognizes privileged administrative roles`: **PASSED**
- `generates and decodes secure JWT user session tokens`: **PASSED**

#### 5. Database Integration & Persistence (`tests/integration/db.test.ts`)
- `retrieves seeded categories and verified product associations`: **PASSED**
- `verifies product inventory synchronization and stock records`: **PASSED**
- `verifies store settings configuration`: **PASSED**

#### 6. India-Wide Marketplace & Supplier Price Engine (`tests/integration/marketplace.test.ts`)
- `verifies 30 marketplace departments are seeded and active`: **PASSED**
- `verifies Department-to-Category hierarchy`: **PASSED**
- `verifies product variants and pack sizes`: **PASSED**
- `verifies multi-supplier pricing engine and identifies cheapest offer`: **PASSED**
- `verifies nationwide pincode serviceability rules`: **PASSED**
- `verifies dark store fulfilment centres`: **PASSED**
- `verifies delivery pricing rules`: **PASSED**
- `verifies delivery slot capacity and booking`: **PASSED**

#### 7. Admin, Rider & Multi-Experience RBAC Security Tests (`tests/integration/auth_rbac_riders.test.ts`)
- `verifies that admin_me exists with SUPER_ADMIN role and mustChangePassword flag`: **PASSED**
- `validates password hash for admin_me with initial credential`: **PASSED**
- `verifies that rider_me exists with RIDER role and linked RiderProfile`: **PASSED**
- `validates password hash for rider_me with initial credential`: **PASSED**
- `enforces strict role-based separation in tokens`: **PASSED**
- `simulates order delivery lifecycle and OTP verification logic`: **PASSED**
- `verifies rider earning calculation rules`: **PASSED**

#### 8. Admin Audit Logging & Operations Verification (`tests/integration/audit_and_operations.test.ts`)
- `records and queries system audit log entries for sensitive operations`: **PASSED**
- `enforces business order cancellation rules based on orderStatus`: **PASSED**
- `validates Delivery OTP verification and security limits`: **PASSED**
- `validates delivery pricing logic across local and nationwide thresholds`: **PASSED**

#### 9. End-to-End Workflow Audit (`tests/e2e/workflow_audit.test.ts`)
- `registers a customer with secure bcrypt password hashing`: **PASSED**
- `generates and verifies JWT session token with customer claims`: **PASSED**
- `verifies Super Admin and Staff RBAC permissions`: **PASSED**
- `retrieves active products filtered by category and search`: **PASSED**
- `creates, updates, and persists customer shopping cart`: **PASSED**
- `validates coupon application against cart total`: **PASSED**
- `creates an order with items, calculates delivery fee, and transitions state`: **PASSED**
- `creates delivery record with tracking number and coordinates`: **PASSED**
- `updates product inventory stock levels upon order confirmation`: **PASSED**
- `updates customer profile and persists address preferences`: **PASSED**
- `enforces unauthorized access blocks on protected customer/admin routes`: **PASSED**
