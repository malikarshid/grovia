# GROVIA: Staging Deployment & Operational Readiness Report

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Report Type:** Staging Deployment Preparation & Reliability Engineering Audit  
**Date:** November 23, 2026  
**Auditor:** Senior DevOps & Application Reliability Engineer  
**Git Commit Target:** `667d9b6` (Clean HEAD)  
**Repository:** `https://github.com/malikarshid/Grovia.git`  

---

## 1. Executive Deployment Readiness Matrix

| Area | Status | Evidence / Notes |
|---|---|---|
| **Codebase Build & Compilation** | **VERIFIED** | `next build` compiled 100/100 routes with 0 errors |
| **Type Safety & Schema Integrity** | **VERIFIED** | `tsc --noEmit` and Prisma validate passed cleanly |
| **Automated Test Coverage** | **VERIFIED** | 11 test suites passed, 73 tests passed (100% pass rate) |
| **Dual-Engine Database Setup** | **VERIFIED** | SQLite local active; PostgreSQL schema & DDL compiled |
| **Staging Database Migration Run** | **NOT TESTED / BLOCKED** | Requires operator to supply staging PostgreSQL connection |
| **Rider Portal & Delivery Lifecycle** | **VERIFIED** | Availability, in-flight locks, random OTP verified |
| **Customer Shopping Storefront** | **VERIFIED** | Hyperlocal catalog, cart, address, orders verified |
| **Admin Operations & RBAC** | **VERIFIED** | 18 admin screens, edge middleware guards, audit logs |
| **Razorpay Payment Gateway** | **IMPLEMENTED / BLOCKED** | Architecture, HMAC & webhooks verified; needs merchant keys |
| **Google Maps Geolocation** | **IMPLEMENTED / BLOCKED** | Distance API & Haversine fallback active; needs API key |
| **Logistics & Courier Delivery** | **IMPLEMENTED / BLOCKED** | Multi-carrier adapters active; needs live carrier tokens |
| **Production Health Monitoring** | **VERIFIED** | `/api/health` reports system & database status securely |
| **Secrets & Credential Hygiene** | **VERIFIED** | Zero secrets in Git; `.gitignore` strictly enforced |

---

## 2. Staging Infrastructure & Deployment Architecture

```
                          +-------------------------+
                          |   Internet / Customers  |
                          +-------------------------+
                                       |
                                       v
                          +-------------------------+
                          | Cloudflare / Reverse    |
                          | Proxy (SSL & WAF)       |
                          +-------------------------+
                                       |
                                       v
                          +-------------------------+
                          | Next.js 14 App Service  |
                          | (Node.js 18+ / Docker)  |
                          +-------------------------+
                                |              |
                +---------------+              +---------------+
                |                                              |
                v                                              v
  +---------------------------+                  +---------------------------+
  | Managed PostgreSQL 15/16  |                  | External APIs (Fallback)  |
  | (Supabase / AWS RDS /     |                  | - Razorpay (Demo Standby) |
  | Neon Cloud Database)      |                  | - Google Maps (Haversine) |
  +---------------------------+                  | - Delhivery (Simulator)   |
                                                 +---------------------------+
```

### Staging Smoke Test Procedure
Immediately after deploying the container or server to staging:
1. **Health Verification:**
   ```bash
   curl -i https://staging.grovia.in/api/health
   # Expected HTTP 200 with status: "HEALTHY", database.status: "CONNECTED"
   ```
2. **Customer Registration & Checkout:**
   - Register a new customer via `/auth/register`.
   - Add a product to the cart and complete checkout.
   - Confirm receipt of 4-digit delivery OTP.
3. **Rider Acceptance & Delivery Handshake:**
   - Log in as test rider via `/rider/login`.
   - Toggle Online and accept the assigned order.
   - Enter customer OTP at the delivery doorstep step and confirm delivery completion.
4. **Admin Verification:**
   - Log in via `/admin/login`.
   - Inspect the order status and verify that an entry was created in the Audit Log.

---

## 3. Operational Playbook & Recovery Procedures

### 3.1 Process Management & Restarts
When running on dedicated virtual machines (AWS EC2 / Ubuntu):
```bash
# Manage Next.js process via PM2
pm2 start npm --name "grovia-staging" -- start
pm2 status
pm2 logs grovia-staging
pm2 restart grovia-staging
```

### 3.2 Health Check & Alerts
Configure staging uptime monitoring (UptimeRobot, Datadog, or BetterStack):
- **Health URL:** `https://staging.grovia.in/api/health`
- **Interval:** 60 seconds
- **Alert Condition:** HTTP status $\neq 200$ or `status != "HEALTHY"` for 2 consecutive cycles.

### 3.3 Rollback Plan
If an unrecoverable defect occurs during a staging release:
1. **Rollback Code:**
   ```bash
   git checkout <PREVIOUS_STABLE_COMMIT_HASH>
   npm run build
   pm2 restart grovia-staging
   ```
2. **Rollback Database:**
   Restore from the pre-deployment database dump using `pg_restore`.

---

## 4. Final Verdict & Next Steps

### Is GROVIA suitable for Local Development?
**YES (100% OPERATIONAL).**  
All functionality, database models, seeds, and test suites run completely and reliably without external dependencies.

### Is GROVIA suitable for Staging Deployment?
**YES (READY FOR DEPLOYMENT).**  
The application is structurally and operationally ready to deploy to a staging server. The only external action required is provisioning a staging PostgreSQL database instance and setting `POSTGRESQL_URL`.

### Is GROVIA suitable for Live Production Deployment?
**NO (BLOCKED ON THIRD-PARTY VENDOR CREDENTIALS).**  
Do not claim production readiness merely because the code builds. Live commercial operations remain blocked until:
1. Live Razorpay merchant production credentials are provided.
2. Google Maps Platform production server API key is provided.
3. Commercial B2C courier contracts (Delhivery / Shiprocket) are active.
4. Production PostgreSQL database is provisioned and migrated.
