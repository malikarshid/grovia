# GROVIA — Fresh Living. Smarter Shopping.

A modern, full-stack grocery shopping and hyper-local marketplace platform designed for high-concurrency order processing, multi-department grocery catalog browsing, dark store inventory fulfillment, and dedicated delivery rider operations across India.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-100%25_Passing-4CAF50?logo=vitest&logoColor=white)](./GROVIA_TEST_REPORT.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## 1. Project Overview

GROVIA is built from the ground up to support the fast-paced grocery shopping experience inspired by platforms like Zepto, Blinkit, and BigBasket. It provides three distinctly isolated user experiences powered by a unified Next.js 14 backend and Prisma database:

1. **Customer Storefront:** Hyperlocal grocery shopping with 10-15 minute instant delivery and nationwide surface express options, dynamic search, multi-department catalog, coupons, and live tracking.
2. **Administration Operations Portal:** Real-time business management dashboard with inventory movements, product catalog CRUD, order fulfillment, delivery partner dispatching, staff permissions, and immutable audit logs.
3. **Dedicated Delivery Rider Portal:** Dedicated mobile-first interface for delivery partners to manage online/offline duty status, accept/decline orders, follow navigation routes, perform OTP-verified drop-offs, and track earnings ledgers.

---

## 2. Key Features Across Experiences

### A. Customer Storefront
- **Department Browsing:** 16 primary departments covering Fresh Fruits, Dairy, Atta & Dal, Organic Groceries, Meat & Seafood, and Home Care.
- **Serviceability Check:** Dynamic 6-digit Indian PIN code validation routing orders to either local 10-15 min quick delivery or nationwide 2-4 day surface express.
- **Smart Cart & Checkout:** Server-validated subtotals, free delivery progress indicators, coupon code validation, and multi-address management.
- **Visual Order Tracking:** Live order progress timeline (`PENDING` → `CONFIRMED` → `PROCESSING` → `ASSIGNED` → `OUT_FOR_DELIVERY` → `ARRIVED` → `DELIVERED`) with driver contact details and customer delivery verification OTP.

### B. Administrative Management Portal
- **Dashboard Metrics:** Real-time revenue figures, order volume graphs, active delivery count, and out-of-stock inventory alerts.
- **Catalog & Inventory Engine:** Multi-variant product creation, category management, batch stock adjustments, and automatic inventory movements tracking.
- **Rider Fleet Operations:** Live rider duty tracking, manual and automated order assignment, rider earnings settlement, and performance metrics.
- **Security & Governance:** Edge Middleware route guards, role-based access control (`SUPER_ADMIN`, `ADMIN`, `INVENTORY_MGR`, `ORDER_MGR`), and detailed immutable audit logs.

### C. Delivery Rider Portal
- **Duty Availability Switch:** Real-time Online/Offline toggle with database persistence across refreshes and active-order lockout protection.
- **Order Management:** View incoming tasks, accept/decline assignments, review product checklists, and navigate to dark store hubs and customer drop-offs.
- **Cryptographic Delivery OTP:** Mandatory customer verification OTP required before marking orders as delivered, eliminating unauthorized drop-offs.
- **Earnings Ledger:** Detailed financial summaries including base pay, distance compensation, peak surge bonuses, and customer tips.

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (Strict Mode enabled)
- **Database ORM:** Prisma ORM v5.22.0
- **Database Engine:** Dual-mode architecture supporting SQLite 3 locally and PostgreSQL 14+ in production
- **Styling:** Tailwind CSS with custom brand themes (`#2E7D32`, `#FF6F00`, `#E53935`)
- **Theme Modes:** Light Mode, Dark Mode, and Eye Protection Warm Mode (`#FBF7EE`)
- **Authentication:** Edge WebCrypto JWT sessions with HTTP-only cookies and bcryptjs password hashing
- **Testing:** Vitest v2.1.9 with `@testing-library/react` and `jsdom`

---

## 4. Project Directory Structure

```
Grovia/
├── prisma/
│   ├── schema.prisma               # Active development schema (SQLite)
│   ├── schema.postgresql.prisma    # Production target schema (PostgreSQL)
│   ├── migrations/                 # Pre-compiled DDL migration scripts
│   ├── seed.js                     # Primary store catalog seed script
│   ├── seed-marketplace.js         # Comprehensive 16-department catalog seed
│   └── seed-security-riders.js     # Administrative and rider roster seed
├── src/
│   ├── app/
│   │   ├── (store)/                # Customer Storefront routes
│   │   ├── admin/                  # Administrative Management routes
│   │   ├── rider/                  # Dedicated Rider Portal routes
│   │   ├── api/                    # REST API route handlers
│   │   │   ├── auth/               # Customer, Admin & Rider auth handlers
│   │   │   ├── rider/              # Rider availability, orders & earnings
│   │   │   ├── payment/            # Razorpay order generation & webhooks
│   │   │   ├── logistics/          # Courier manifestation & tracking
│   │   │   └── health/             # System health & telemetry endpoint
│   │   └── layout.tsx              # Root HTML and metadata layout
│   ├── components/                 # Reusable UI component library
│   ├── lib/                        # Prisma client, auth, and formatting utilities
│   ├── services/                   # Payment, Maps, and Courier service abstractions
│   └── store/                      # Zustand client-side state stores
├── tests/                          # Automated unit, integration, and E2E test suites
└── scripts/                        # Database migration and synchronization tools
```

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js v18.17+ or v20+
- npm v9+

### Step 1: Clone Repository
```bash
git clone https://github.com/malikarshid/Grovia.git
cd Grovia
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Configuration
Copy the template to create your local `.env`:
```bash
cp .env.example .env
```

### Step 4: Initialize & Seed Database
```bash
# Push schema to local SQLite database
npx prisma db push

# Run idempotent seeds
npm run prisma:seed
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Development & Quality Commands

```bash
# Start development server
npm run dev

# Run full automated test suite (10 test suites, 66+ tests)
npm test

# Run strict TypeScript compilation check (0 errors)
npx tsc --noEmit

# Validate Prisma schema
npx prisma validate

# Compile optimized production build
npm run build

# Start production server
npm run start

# Free port 3000 if occupied by a background process
npm run clean:ports
```

---

## 7. Project Documentation Index

Detailed architectural and operational documentation is available in the repository:

- [GROVIA Technical Completion Report](./GROVIA_COMPLETION_REPORT.md)
- [Master Technical Audit & Verification](./GROVIA_MASTER_AUDIT.md)
- [Automated Test Execution Report](./GROVIA_TEST_REPORT.md)
- [Rider Portal Repair Report](./GROVIA_RIDER_FIX_REPORT.md)
- [PostgreSQL Production Database Migration](./GROVIA_DATABASE_MIGRATION.md)
- [Payment Gateway & Razorpay Integration](./GROVIA_PAYMENT_INTEGRATION.md)
- [Google Maps & Location Services](./GROVIA_MAPS_INTEGRATION.md)
- [Courier & Logistics Integration Guide](./GROVIA_COURIER_INTEGRATION.md)
- [India-Wide Serviceability & PIN Guide](./GROVIA_SERVICEABILITY_GUIDE.md)
- [Security Hardening & Threat Model](./GROVIA_SECURITY_AUDIT.md)
- [Production Deployment & Monitoring](./GROVIA_DEPLOYMENT_GUIDE.md)
- [Setup & Runtime Guide](./GROVIA_SETUP_GUIDE.md)

---

## 8. Project Roadmap

The implementation roadmap tracks feature status against verified source code:

- [x] **Customer storefront foundation:** Verified with 16 departments, search, and category navigation.
- [x] **Product catalogue foundation:** 100+ verified items with active CDN images, pricing, and nutritional info.
- [x] **Customer, admin, and rider portal structure:** 3 isolated application experiences with Edge guards.
- [x] **Product variants and category architecture:** Multi-variant support and stock thresholds.
- [x] **Order management foundation:** Server-calculated subtotals, coupons, and atomic stock decrements.
- [x] **Complete rider availability and delivery workflow verification:** Fully functional Online/Offline persistence, in-flight order lock, and random OTP verification.
- [x] **Production PostgreSQL migration verification:** Dual-mode schema and pre-compiled DDL migrations ready.
- [ ] **Live payment gateway integration:** Architecture, HMAC verification, and webhooks implemented; *BLOCKED: Requires live Razorpay merchant credentials*.
- [ ] **Live Google Maps and GPS integration:** Client/server split and Haversine fallback active; *BLOCKED: Requires live Google Maps Platform API keys*.
- [ ] **Courier API integration and end-to-end testing:** Manifesting engine and tracking timeline active; *BLOCKED: Requires live Delhivery/Shiprocket API tokens*.
- [ ] **Production cloud deployment:** Build and health check verified; *BLOCKED: Requires cloud infrastructure provisioning*.
- [ ] **Expanded nationwide fulfilment coverage:** 18 cities active; *PARTIAL: Adding additional Tier-2/3 fulfilment hubs*.

---

## 9. Author & License

**Developed by:** Arshid Ahmad Malik  
**GitHub:** [https://github.com/malikarshid](https://github.com/malikarshid)  
**Repository:** [https://github.com/malikarshid/Grovia](https://github.com/malikarshid/Grovia)  
**License:** MIT License. See [LICENSE](./LICENSE) for details.
