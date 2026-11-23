# GROVIA INDIA-WIDE GROCERY MARKETPLACE
## COMPREHENSIVE ARCHITECTURAL & DELIVERY REPORT
### Fresh Living. Smarter Shopping.

**Date:** November 22, 2026  
**Project Workspace:** `C:\Project\Grovia`  
**Application Platform:** Full-Stack India-Wide Grocery Marketplace & Quick Commerce Engine  
**Tech Stack:** Next.js 14 (App Router), TypeScript 5.6, Prisma ORM, SQLite/PostgreSQL, Tailwind CSS, Lucide, Recharts, Framer Motion, Zustand, Vitest  

---

## 1. EXECUTIVE SUMMARY

GROVIA has been successfully transformed from a local grocery store prototype into an enterprise-grade, scalable **India-Wide Grocery Marketplace** inspired by Zepto, Blinkit, BigBasket, and JioMart.

All existing customer accounts, admin accounts, orders, inventory records, and design tokens (Primary Green `#2E7D32`, Accent Orange `#FF6F00`, Light Bg `#FAFAFA`, Card `#FFFFFF`, Error `#E53935`, 3 Display Themes) were strictly preserved while introducing:
- **30 Marketplace Departments** with subcategories and leading Indian brand entities.
- **Multi-size Product Variants** (250g, 500g, 1kg, 5kg, 10kg, multipacks) linked without duplicating base SKUs.
- **Multi-Supplier Price Comparison Engine** showing transparent distributor offers and awarding the **"★ Lowest Price / Smart Price"** badge.
- **Dual Fulfilment Network:** 10–30 minute hyper-local Dark Stores and nationwide express surface shipping.
- **Location & Serviceability Engine:** HTML5 Geolocation auto-detection with distance calculations + 6-digit Indian PIN code routing.
- **Live Delivery Fleet & GPS Tracking:** Real-time driver GPS tracking panel with moving driver coordinates and nationwide AWB courier status.
- **6 New Admin Operations Modules:** Marketplace SKUs, Fulfilment Centres, Serviceable PINs, Delivery Pricing Rules, Fleet Tracking, and Supplier Imports.

---

## 2. 30 MARKETPLACE DEPARTMENTS & BRAND SYSTEM

The catalog has been expanded with a 30-department architecture:
1. `fruits-vegetables` (Fruits and Vegetables)
2. `dairy-bread-eggs` (Dairy, Bread and Eggs)
3. `atta-rice-dal` (Atta, Rice and Dal)
4. `masala-oil-dry-fruits` (Masala, Oil and Dry Fruits)
5. `snacks-munchies` (Snacks and Munchies)
6. `cold-drinks-juices` (Cold Drinks and Juices)
7. `breakfast-instant-food` (Breakfast and Instant Food)
8. `bakery-biscuits` (Bakery and Biscuits)
9. `chocolates-sweets` (Chocolates and Sweets)
10. `tea-coffee` (Tea and Coffee)
11. `meat-fish-seafood` (Meat, Fish and Seafood)
12. `frozen-food` (Frozen Food)
13. `baby-care` (Baby Care)
14. `personal-care` (Personal Care)
15. `beauty-hygiene` (Beauty and Hygiene)
16. `bath-body` (Bath and Body)
17. `cleaning-essentials` (Cleaning Essentials)
18. `household-supplies` (Household Supplies)
19. `kitchen-essentials` (Kitchen Essentials)
20. `pet-care` (Pet Care)
21. `health-wellness` (Health and Wellness)
22. `organic-natural-products` (Organic and Natural Products)
23. `regional-indian-foods` (Regional Indian Foods)
24. `pooja-essentials` (Pooja Essentials)
25. `stationery-daily-needs` (Stationery and Daily Needs)
26. `packaged-food` (Packaged Food)
27. `home-lifestyle` (Home and Lifestyle)
28. `seasonal-products` (Seasonal Products)
29. `festival-essentials` (Festival Essentials)
30. `other-grocery-products` (Other Grocery Products)

**National Brands Seeded & Integrated:**
Amul, Aashirvaad, Tata Sampann, Fortune, Haldiram's, India Gate, Dettol, Surf Excel, Dabur, Nescafe, Saffola, Britannia, Everest, Epigamia, Nandini, and Grovia Organic Farm.

---

## 3. PRODUCT VARIANTS & SMART PRICE ENGINE

- **Data Models:** `ProductVariant`, `SupplierOffer`, `PriceHistory`.
- **Variant Capabilities:**
  - Base product holds primary attributes, imagery, and category links.
  - Variants define pack sizes (e.g. Aashirvaad Atta: 1kg Pouch ₹68, 5kg Bag ₹310, 10kg Family Pack ₹595).
  - Customers can switch variants directly from the product card or detail page without page reloads.
- **Smart Price Engine:**
  - Multiple B2B suppliers (Bangalore Wholesale FMCG Mart, Metro Cash & Carry, Reliance Consumer Direct) submit wholesale offers.
  - The system automatically computes the cheapest available offer and awards the **"★ Lowest Price / Smart Price"** badge.

---

## 4. LOCATION DETECTION & SERVICEABILITY ENGINE

- **API Endpoint:** `GET /api/location/serviceability`
- **Geolocation Resolution:**
  - Calculates Haversine distance from browser coordinates to nearest dark stores.
  - If within operational radius (8–15 km), resolves to `QUICK_LOCAL` with dynamic ETA (e.g. 15–20 mins).
- **PIN Code Routing:**
  - High-density metro PINs (Bengaluru 560038, Mumbai 400053, Gurugram 122002, Hyderabad 500081) route to local dark stores.
  - Non-metro / Tier 2/3 PINs (Pune 411001, Jaipur 302001, Kolkata 700001, Lucknow 226001) route to `NATIONWIDE` express surface shipping via Shiprocket / Delhivery architecture.
- **Interactive Location Modal:** Accessible via the top location selector in `CustomerHeader.tsx`, supporting GPS auto-detection and 6-digit PIN checks.

---

## 5. DUAL FULFILMENT & DARK STORE ARCHITECTURE

| Centre Code | Facility Name | Type | City / State | Radius | Capacity |
|---|---|---|---|---|---|
| `BLR-IND-01` | Bengaluru Central Dark Store | `DARK_STORE` | Bengaluru, Karnataka | 10.0 km | 150 orders/hr |
| `BLR-KOR-02` | Bengaluru South Dark Store | `DARK_STORE` | Bengaluru, Karnataka | 12.0 km | 180 orders/hr |
| `BOM-AND-01` | Mumbai Western Dark Store | `DARK_STORE` | Mumbai, Maharashtra | 8.0 km | 200 orders/hr |
| `DEL-GUR-01` | Delhi NCR Fulfilment Hub | `DARK_STORE` | Gurugram, Haryana | 15.0 km | 160 orders/hr |
| `HYD-HIT-01` | Hyderabad Tech Hub Dark Store | `DARK_STORE` | Hyderabad, Telangana | 12.0 km | 140 orders/hr |
| `NAT-NAG-01` | Central National Distribution Centre | `WAREHOUSE` | Nagpur, Maharashtra | 2500 km | 1000 orders/hr |

---

## 6. DELIVERY FLEET & LIVE GPS TRACKING

- **Data Models:** `DeliveryPartner`, `DriverLocation`, `CourierProvider`, `Shipment`.
- **Live Driver GPS Tracking:**
  - Interactive SVG route simulation displaying Dark Store origin, Customer doorstep, moving driver marker with pulsing radar waves, telemetry speed, and live ETA countdown.
  - Direct call button connecting customer with the delivery partner.
- **Nationwide Courier Timeline:**
  - Automatic AWB code generation (`AWB-DLV-xxxxx`) and tracking checkpoint milestones (Manifested → In Transit → Out for Delivery → Delivered).

---

## 7. EXTENDED ADMIN OPERATIONS DASHBOARD

Six specialized administration modules have been implemented:
1. **`/admin/marketplace`:** Department-wise SKU management, pack size variants table, and verified supplier offer comparisons.
2. **`/admin/fulfilment-centres`:** Dark store registration, delivery radiuses, hourly throughput capacities, and active status.
3. **`/admin/serviceability`:** PIN code directory with delivery mode filters (`QUICK_LOCAL` vs `NATIONWIDE`) and hub routing.
4. **`/admin/pricing-rules`:** Configurable small order fees, express delivery fees, nationwide courier fees, and free delivery campaign announcements.
5. **`/admin/fleet-tracking`:** Real-time driver radar display with vehicle registrations, on-duty status, and GPS telemetry simulator.
6. **`/admin/supplier-imports`:** Bulk catalogue ingestion supporting JSON / CSV batch uploads with validation, error logs, and execution history.

---

## 8. TEST & BUILD VERIFICATION

### Vitest Test Suite Results
```
✓ tests/unit/coupons.test.ts (4 tests)
✓ tests/unit/calculations.test.ts (4 tests)
✓ tests/integration/db.test.ts (3 tests)
✓ tests/integration/marketplace.test.ts (8 tests)
✓ tests/unit/auth.test.ts (2 tests)
✓ tests/e2e/workflow_audit.test.ts (11 tests)

Test Files:  6 passed (6)
Tests:       32 passed (32)
```

### Production Build Results
```
✓ Compiled successfully
Linting and checking validity of types ...
Generating static pages (66/66) ...
Finalizing page optimization ...
All 66 routes generated cleanly with 0 errors.
```

---

## 9. CREDENTIALS & ACCESS

- **Super Admin:** `admin@grovia.in` / `Grovia@Admin2026`
- **Inventory Manager:** `inventory@grovia.in` / `Grovia@Staff2026`
- **Customer:** `rahul.sharma@example.com` / `Customer@123`
- **Storefront URL:** `http://localhost:3000`
- **Admin Portal URL:** `http://localhost:3000/admin`
