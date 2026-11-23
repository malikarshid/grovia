# GROVIA: Production Readiness & Go-Live Criteria Report

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Version:** 1.0.0 (Pre-Production Evaluation)  
**Date:** November 23, 2026  
**Auditor:** Principal Software Architect, Cybersecurity Auditor & DevOps Engineer  
**Current Verdict:** **NOT PRODUCTION-READY FOR LIVE COMMERCIAL TRANSACTIONS (BLOCKED ON THIRD-PARTY VENDOR CREDENTIALS & PRODUCTION INFRASTRUCTURE)**  

---

## 1. Executive Summary & Why Compilation $\neq$ Production Readiness

A modern full-stack grocery marketplace involves financial transactions, legal liabilities, physical inventory movements, customer privacy, and real-time delivery logistics. 

While GROVIA's code architecture, error boundaries, automated test suites (73 passing tests), and Next.js production build (`npm run build` compiling 100/100 routes) are verified, **GROVIA cannot and must not be declared production-ready for live commerce until external vendor integrations and managed infrastructure are provisioned.**

```
+-------------------------------------------------------------------------+
|                      PRODUCTION READINESS SPECTRUM                      |
+-------------------------------------------------------------------------+
| Local Development      | Staging Deployment    | Production Operations  |
| 100% OPERATIONAL       | READY FOR DEPLOYMENT  | BLOCKED ON VENDORS     |
| [VERIFIED]             | [READY]               | [BLOCKED]              |
+-------------------------------------------------------------------------+
```

---

## 2. Production Blockers & External Requirements Matrix

To transition from the currently verified staging build to a live commercial public launch, the operating business entity must complete the following six milestones:

| # | Domain | Requirement | Current Status | Required Action for Production |
|---|---|---|---|---|
| 1 | **Database** | Managed PostgreSQL 15/16 with HA & point-in-time recovery | **BLOCKED** | Provision Supabase / AWS RDS / Neon instance and execute migration |
| 2 | **Payments** | Live Razorpay merchant account & webhook secret | **BLOCKED** | Complete KYC, activate live keys, set `PAYMENT_MODE=LIVE` |
| 3 | **Geolocation** | Google Maps Platform API key with billing enabled | **BLOCKED** | Activate Distance Matrix & Geocoding APIs, configure domain restrictions |
| 4 | **Logistics** | Live commercial B2C courier contracts | **BLOCKED** | Sign agreements with Delhivery Express and Shiprocket; supply tokens |
| 5 | **Legal / Privacy** | Formal legal terms, privacy & cancellation policy review | **BLOCKED** | Engage qualified Indian legal counsel for IT Act 2000 & Consumer Protection |
| 6 | **Infrastructure** | Production domain, SSL termination, and CDN WAF | **BLOCKED** | Configure Cloudflare DNS, SSL certificate, and OWASP Core Ruleset |

---

## 3. Pillar-by-Pillar Readiness Assessment

### 3.1 Application Codebase & Performance
- **Status:** **VERIFIED**
- **Evidence:**
  - 100/100 Next.js routes compile cleanly with zero TypeScript errors.
  - Server-side calculations for subtotals, taxes, delivery fees, and coupons prevent client manipulation.
  - Edge Middleware (`src/middleware.ts`) protects administrative and rider routes with minimal latency (27 kB bundle).

### 3.2 Database Engine & Transactions
- **Status:** **BLOCKED (Requires Live PostgreSQL Setup)**
- **Evidence:**
  - SQLite development engine runs smoothly locally.
  - PostgreSQL schema (`prisma/schema.postgresql.prisma`) and DDL (`migration.sql`) are validated.
  - Live execution against a production PostgreSQL database cluster with replication and daily automated snapshots has not yet occurred.

### 3.3 Financial & Payment Operations
- **Status:** **BLOCKED (Requires Live Merchant Account)**
- **Evidence:**
  - Razorpay order creation, timing-safe HMAC SHA-256 signature verification, webhook idempotency, and failed payment handling are coded and tested.
  - Live transactions cannot occur without active Razorpay KYC and production keys.

### 3.4 Geolocation & Delivery Routing
- **Status:** **BLOCKED (Requires Live Google Maps Key)**
- **Evidence:**
  - Client/server separation is enforced; server keys are never exposed in browser bundles.
  - Haversine mathematical fallback formula provides robust offline estimations.
  - Real-time traffic-aware street routing requires an active Google Maps Platform billing account.

### 3.5 Nationwide Logistics & Fulfillment
- **Status:** **BLOCKED (Requires Commercial Carrier Contracts)**
- **Evidence:**
  - Multi-carrier adapters (`courierService.ts`) support Delhivery and Shiprocket.
  - Standby simulator provides realistic tracking timelines for testing.
  - Live surface dispatch requires active B2C contracts and client tokens.

---

## 4. Production Go-Live Checklist

Follow this checklist prior to announcing public availability:

- [ ] **Infrastructure Provisioning:**
  - [ ] PostgreSQL production database instance provisioned with SSL (`sslmode=require`).
  - [ ] Non-destructive migration applied via `psql` or `prisma migrate deploy`.
  - [ ] Database automated snapshot schedule enabled (minimum 7-day retention).
  - [ ] Connection pooler (PgBouncer) configured.
- [ ] **Secret Injection:**
  - [ ] Generate unique 64-character secrets for `JWT_SECRET` and `NEXTAUTH_SECRET`.
  - [ ] Set `ALLOW_DEFAULT_INITIAL_PASSWORD="false"`.
  - [ ] Inject production Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`).
  - [ ] Set `PAYMENT_MODE="LIVE"`.
  - [ ] Inject Google Maps API keys (`GOOGLE_MAPS_SERVER_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
  - [ ] Inject courier tokens (`DELHIVERY_API_TOKEN`, `SHIPROCKET_API_EMAIL`, `SHIPROCKET_API_PASSWORD`).
- [ ] **Security & Network:**
  - [ ] Cloudflare WAF enabled with rate-limiting on `/api/auth/*` and `/api/rider/orders/*/status`.
  - [ ] HTTPS enforced with HSTS (`max-age=31536000; includeSubDomains`).
  - [ ] Reverse proxy CORS headers restricted strictly to production domain.
- [ ] **Monitoring & Health Checks:**
  - [ ] Configure synthetic ping monitoring on `https://grovia.in/api/health` (1-minute interval).
  - [ ] Alert escalation channels (PagerDuty, Slack, Email) configured for 5xx errors.
- [ ] **Legal & Operations:**
  - [ ] Qualified legal review of Terms of Service, Privacy Policy, and Return/Refund Policy.
  - [ ] Customer support escalation channels (email/WhatsApp) tested.
