# GROVIA Enterprise Administration & Management Guide
## Fresh Living. Smarter Shopping.

### Overview
The **GROVIA Private Administration Portal** is a secured enterprise back-office management console for operations managers, category leads, inventory controllers, and dispatchers.

---

### Access & Security Boundaries
- **Access Route**: Strictly via direct URL `http://localhost:3000/admin/login` or `http://localhost:3000/admin`.
- **Storefront Isolation**: Zero administrative links, buttons, or credentials appear on customer-facing storefront pages (`/`, `/products`, `/categories`, `/cart`, `/checkout`, `/orders`, `/profile`).
- **Initial Login ID**: `admin_me` (or `admin@grovia.in`)
- **Initial Password**: `9682pw`
- **Security Policy**:
  - Protected at server edge via Next.js `middleware.ts`.
  - Non-administrative roles (`CUSTOMER`, `RIDER`, unauthenticated) are blocked and redirected to `/admin/login`.
  - Forced first-login password change: prompt forces setting a personal secure password when `mustChangePassword === true`.
  - In production (`NODE_ENV === 'production'`), default password `9682pw` is rejected by backend authentication.
  - Account lockout after 5 consecutive failed login attempts (15-minute lock).

---

### Admin Portal Modules

#### 1. Marketplace & Catalog Management
- **Dashboard (`/admin`)**: Live gross merchandise value (GMV), order volume, category performance, and source distribution.
- **Products (`/admin/products`)**: Multi-variant SKU management, pricing, inventory alerts, and tax rate configuration.
- **Categories (`/admin/categories`)**: 30 Department structure and subcategories.
- **Marketplace SKUs (`/admin/marketplace`)**: Multi-supplier SKU curation, competitive supplier price engine, and margin optimization.
- **Supplier Imports (`/admin/supplier-imports`)**: Bulk CSV/Excel product catalog imports.

#### 2. Logistics & Fleet Operations
- **Riders Fleet (`/admin/riders`)**: Delivery partner fleet directory, live duty states (IDLE, EN_ROUTE, OFFLINE), completed trips, customer ratings, wallet balances, and suspension toggles.
- **Rider Profile (`/admin/riders/[id]`)**: Full vehicle credentials, driving license verification, trip history audit log, and earnings dossier.
- **Dispatch Console (`/admin/rider-assignments`)**: Matrix of unassigned confirmed orders and available nearby riders with one-click dispatch.
- **Fleet Tracking (`/admin/fleet-tracking`)**: Real-time GPS fleet positions and active delivery route monitoring.
- **Rider Performance (`/admin/rider-performance`)**: On-time delivery SLA analytics (98.4%), average 10-minute trip times, and customer satisfaction ratings.
- **Rider Settlements (`/admin/rider-earnings`)**: Weekly automated settlement engine, wallet balances audit, and instant "Approve & Settle" payout processing.

#### 3. Fulfilment & Serviceability
- **Fulfilment Centres (`/admin/fulfilment-centres`)**: Dark stores, regional warehouses, delivery radii, and hourly throughput limits.
- **PIN Serviceability (`/admin/serviceability`)**: Nationwide pincode serviceability rules (Instant 10-min delivery, standard courier, or unserviceable).
- **Delivery Pricing (`/admin/pricing-rules`)**: Distance fees, rain/surge multipliers, and free delivery thresholds (₹499).
