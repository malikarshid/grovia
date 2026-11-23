# GROVIA — Fresh Living. Smarter Shopping.

A premier full-stack, India-wide grocery marketplace and quick commerce operations platform inspired by Zepto, Blinkit, BigBasket, and JioMart.

![GROVIA Marketplace Banner](https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Overview

**GROVIA** delivers a complete end-to-end grocery ecosystem combining a fast, hyper-local consumer marketplace with an enterprise multi-store dark store and nationwide logistics dashboard. Operating across India in Indian Rupees (`₹`), GROVIA features 30 specialized grocery departments, multi-supplier price comparison engines, 10–30 minute quick dark store delivery, nationwide courier shipping via Shiprocket/Delhivery integration, and live GPS driver tracking.

- **Customer Storefront:** `http://localhost:3000` (Zero administrative exposure)
- **Private Admin Portal:** `http://localhost:3000/admin/login` (`admin_me` / `9682pw`)
- **Dedicated Delivery Rider Portal:** `http://localhost:3000/rider/login` (`rider_me` / `Rider@9682pw`)
- **Default Currency:** INR (`₹`)
- **Default Market:** India (Active Hubs: Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Nagpur)

### 📚 Documentation Guides
- [GROVIA_COMPLETION_REPORT.md](file:///c:/Project/Grovia/GROVIA_COMPLETION_REPORT.md): Final Master Completion Report
- [RIDER_PORTAL_GUIDE.md](file:///c:/Project/Grovia/RIDER_PORTAL_GUIDE.md): Dedicated Rider Portal Operations Guide
- [ADMIN_GUIDE.md](file:///c:/Project/Grovia/ADMIN_GUIDE.md): Private Administration Portal Guide
- [SECURITY_AUDIT.md](file:///c:/Project/Grovia/SECURITY_AUDIT.md): Security Architecture & RBAC Audit Report

---

## 🎨 Brand Identity & Design System

Rooted in fresh, trustworthy grocery commerce:
- **Primary Brand Green:** `#2E7D32`
- **Accent Action Orange:** `#FF6F00`
- **Light Background:** `#FAFAFA`
- **Card Surface:** `#FFFFFF`
- **Error & Alert Red:** `#E53935`

### 3 Display Themes
1. **Light Mode:** High-contrast crisp white surfaces with fresh emerald accents.
2. **Dark Mode:** Deep slate surfaces (`#0F172A`) for low-light browsing.
3. **Eye Protection Mode:** Warm sepia/cream background (`#FBF7EE`) engineered to reduce blue-light glare and eye strain.

---

## 🇮🇳 India-Wide Marketplace Capabilities

### 1. 30 Marketplace Departments
Supports scalable cataloging with subcategories and brand entities:
1. Fruits and Vegetables
2. Dairy, Bread and Eggs
3. Atta, Rice and Dal
4. Masala, Oil and Dry Fruits
5. Snacks and Munchies
6. Cold Drinks and Juices
7. Breakfast and Instant Food
8. Bakery and Biscuits
9. Chocolates and Sweets
10. Tea and Coffee
11. Meat, Fish and Seafood
12. Frozen Food
13. Baby Care
14. Personal Care
15. Beauty and Hygiene
16. Bath and Body
17. Cleaning Essentials
18. Household Supplies
19. Kitchen Essentials
20. Pet Care
21. Health and Wellness
22. Organic and Natural Products
23. Regional Indian Foods
24. Pooja Essentials
25. Stationery and Daily Needs
26. Packaged Food
27. Home and Lifestyle
28. Seasonal Products
29. Festival Essentials
30. Other Grocery Products

### 2. Multi-Size Product Variants
- Pack sizes (e.g. `250g`, `500g`, `1kg`, `5kg`, `10kg`, multipacks) linked to base SKUs without record duplication.
- Interactive variant chips on product cards and detail pages with instant price, stock, and unit switching.

### 3. Multi-Supplier Price Engine & Smart Price
- Connects verified wholesale distributors (e.g. Bangalore Wholesale FMCG Mart, Metro Cash & Carry, Reliance Consumer Direct).
- Automatic lowest-price detection flagging the cheapest offer with the **"★ Lowest Price / Smart Price"** badge and transparent supplier comparisons.

### 4. Location & PIN Code Serviceability Engine
- **HTML5 Geolocation Auto-Detection:** Distance calculations (Haversine) to the nearest dark store with instant ETA estimation.
- **6-Digit Indian PIN Code Routing:** Immediate resolution between:
  - `⚡ QUICK_LOCAL`: 15–25 min hyper-local dark store delivery.
  - `📦 NATIONWIDE`: 2–4 days express surface courier delivery.
- Interactive location selector in header with metro presets (Indiranagar, Koramangala, Andheri West, DLF Cyber City, HITEC City).

### 5. Multi-Store Fulfilment Network
- **Dark Stores:** Hyper-local micro-warehouses (e.g. `BLR-IND-01`, `BOM-AND-01`, `DEL-GUR-01`, `HYD-HIT-01`) optimized for sub-30 minute fulfillment.
- **National Warehouses:** Central distribution hubs (e.g. `NAT-NAG-01`) powering nationwide surface courier shipments.

### 6. Live Delivery Fleet & GPS Tracking
- Real-time driver GPS tracking panel with moving driver coordinates, telemetry speed, route checkpoints, and driver contact.
- Nationwide AWB courier timeline tracking (Manifested → In Transit → Out for Delivery → Delivered).

---

## 🛠 Admin & Operations Modules

1. **Dashboard:** Real-time business KPIs, revenue, and order sources.
2. **Marketplace SKUs (`/admin/marketplace`):** Complete catalogue across 30 departments with variant matrices and supplier pricing.
3. **Fulfilment Centres (`/admin/fulfilment-centres`):** Dark store management, capacity tracking, delivery radiuses, and stock bay locations.
4. **PIN Serviceability (`/admin/serviceability`):** Serviceable PIN code directory with delivery mode routing.
5. **Delivery Pricing Rules (`/admin/pricing-rules`):** Configurable small order fees, express fees, free delivery campaigns, and min basket sizes.
6. **Fleet Tracking (`/admin/fleet-tracking`):** Live radar map displaying driver telemetry, EV bike assignments, and delivery stats.
7. **Supplier Imports (`/admin/supplier-imports`):** Batch JSON / CSV bulk catalogue ingestion with error validation and history audit logs.
8. **Orders & Inventory:** Stock movements, reservations, and refund management.
9. **Promotions & Staff Management:** RBAC, coupons, and customer loyalty CRM.

---

## 🧪 Testing & Verification

- **Vitest Test Suite:** 32 passing tests (Unit, Integration, E2E)
- **TypeScript:** Strict type checking with 0 errors (`npx tsc --noEmit`)
- **Production Build:** 66/66 Next.js dynamic and static routes built successfully (`npm run build`)

```bash
# Run unit & integration tests
npm test

# Run production build
npm run build

# Start production server
npm start
```

---

## 👥 Default Credentials

- **Super Admin:** `admin@grovia.in` / `Grovia@Admin2026`
- **Inventory Manager:** `inventory@grovia.in` / `Grovia@Staff2026`
- **Customer:** `rahul.sharma@example.com` / `Customer@123`
