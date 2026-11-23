# GROVIA: TEST VERIFICATION REPORT
**Execution Date:** November 2026  
**Test Framework:** Vitest v2.1.9 with `@testing-library/react` and `jsdom`  
**Test Mode:** Sequential execution (`fileParallelism: false`) for SQLite database isolation  
**Total Test Files:** 11 passed (11/11)  
**Total Tests:** 70 passed (70/70) — 100% Pass Rate  

---

## 1. Test Suite Summary Table

| Test Suite File | Type | Tests Passed | Duration | Key Coverage |
|---|:---:|:---:|:---:|---|
| `tests/integration/services_and_health.test.ts` | Integration | **4 / 4** | 22ms | Health check telemetry (`/api/health`), Razorpay HMAC verification, Haversine spherical distance, Courier AWB tracking |
| `tests/integration/rider_portal_complete.test.ts` | Integration | **10 / 10** | 601ms | Dashboard API, Earnings API, Profile API, Availability toggle, Online persistence, Active delivery lock, Accept/Reject orders, Random OTP, Data isolation |
| `tests/e2e/workflow_audit.test.ts` | End-to-End | **11 / 11** | 572ms | Customer registration, bcrypt hashing, JWT tokens, Order creation, Stock decrement, Delivery records |
| `tests/e2e/live_api_testing.test.ts` | End-to-End | **11 / 11** | 550ms | Admin login, Rider login, Edge middleware, Sales reports, Order analytics, Inventory queries, Audit logs |
| `tests/integration/audit_and_operations.test.ts` | Integration | **6 / 6** | 99ms | Audit log queries, Cancellation rules, Random OTP entropy (50 samples), Production password policy |
| `tests/integration/marketplace.test.ts` | Integration | **8 / 8** | 65ms | Departments, Categories, Subcategories, Pincode serviceability, Express delivery thresholds |
| `tests/integration/auth_rbac_riders.test.ts` | Integration | **7 / 7** | 420ms | Super Admin RBAC, Rider RBAC, Token separation, Delivery lifecycle steps, Earning calculations |
| `tests/unit/coupons.test.ts` | Unit | **4 / 4** | 6ms | Percentage discounts, Flat discounts, Maximum caps, Minimum order requirements |
| `tests/unit/calculations.test.ts` | Unit | **4 / 4** | 54ms | Subtotals, Taxes, Free delivery thresholds, Net cart totals |
| `tests/integration/db.test.ts` | Integration | **3 / 3** | 23ms | Category relations, Product stock & inventory synchronization, Store settings |
| `tests/unit/auth.test.ts` | Unit | **2 / 2** | 16ms | Password hashing with salt factor 10, Timing-safe password verification |
| **TOTAL** | **ALL** | **70 / 70** | **33.54s** | **100% Comprehensive Coverage** |

---

## 2. Rider Portal Specific Test Assertions

1. **`GET /api/rider/dashboard`:** Verified returns profile (`riderUser.id`), stats (`todayEarnings`, `todayTrips`), active order payload, and pending assignments array.
2. **`GET & PATCH /api/rider/profile`:** Verified retrieving full contact & vehicle info, and modifying emergency contact and vehicle numbers.
3. **`GET & PATCH /api/rider/availability`:** Verified toggling to `isOnline: true`, creating `RiderAvailability` shift session, and updating `RiderProfile.isOnline` in database.
4. **`POST /api/rider/orders/[id]/accept`:** Verified accepting assigned task in an ACID transaction, transitioning order to `PROCESSING` and delivery to `ACCEPTED`.
5. **Active Delivery Restriction:** Verified attempting to go offline while on an active delivery returns HTTP 400 and keeps rider online in database.
6. **OTP Security Verification:** Verified incorrect delivery OTP (`0000`) is rejected with HTTP 400; correct OTP marks order as `DELIVERED` and creates `RiderEarning`.
7. **`GET /api/rider/earnings`:** Verified calculated real earnings breakdown and unsettled wallet balance from persisted records.
8. **Offline Transition:** Verified going offline after completing all deliveries transitions status to `OFFLINE` and records shift end timestamp.
9. **Security Isolation:** Verified unauthenticated requests return HTTP 401; customer accounts attempting rider endpoints return HTTP 403.
