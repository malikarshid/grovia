# GROVIA India-Wide Grocery Marketplace Upgrade Plan
## Fresh Living. Smarter Shopping.

### Objective
Scale the current GROVIA grocery platform into an enterprise-grade, India-wide grocery marketplace inspired by Zepto, Blinkit, BigBasket, and JioMart. The system supports multi-store fulfilment (dark stores for 10-30 min express delivery + regional warehouses for nationwide courier shipping), location-based inventory, competitive multi-supplier pricing, product variants, and live fleet tracking.

---

## Architecture & Phase Roadmap

### Phase 1: Database Model Extensions & 30 Marketplace Departments
- Expand Prisma Schema:
  - `Department` & `Subcategory` hierarchy covering all 30 marketplace departments.
  - `Brand` entity for brand filtering and manufacturer details.
  - `ProductVariant` entity (e.g., 250g, 500g, 1kg, 2kg, 5kg, multipacks) linked to base `Product`.
  - `SupplierOffer` & `PriceHistory` for multi-supplier price comparison.
  - `FulfilmentCentre` (Dark stores & regional distribution centres with GPS coordinates, delivery radius, capacity).
  - `FulfilmentCentreProduct` (Store-specific inventory).
  - `ServiceablePinCode` & `DeliveryZone` for hyper-local vs nationwide shipping resolution.
  - `DeliveryPricingRule` for configurable nationwide/local fees, small order fees, and free shipping campaigns.
  - `DeliveryPartner` & `DriverLocation` for real-time fleet coordinates, vehicle types, and dispatch states.
  - `CourierProvider` & `Shipment` for nationwide shipping (Shiprocket, Delhivery architecture).
  - `ShoppingList` & `ShoppingListItem` for customer saved grocery lists and "Buy Again".
- Preserve existing data via non-breaking migrations and backward-compatible fields.

### Phase 2: Massive Product Catalogue & Scalable Seed Data
- Seed 30 core Indian grocery departments and subcategories.
- Seed top national & regional Indian brands (Amul, Aashirvaad, Tata Sampann, Fortune, Haldiram's, Dabur, Dettol, Surf Excel, India Gate, Paper Boat, Everest, MDH, etc.).
- Expand products with variants (e.g. Aashirvaad Atta in 1kg, 5kg, 10kg; Amul Milk in 500ml, 1L; Basmati Rice in 1kg, 5kg).
- Seed multiple supplier offers per product to demonstrate the Lowest Price Engine.

### Phase 3: Location System, Google Maps & Serviceable PIN Codes
- Location detection: Browser Geolocation API with explicit user consent.
- Manual PIN code search & City/Area selector for India-wide coverage.
- Google Maps Platform integration (Places Autocomplete, Maps JS API, Reverse Geocoding) with graceful fallback when API keys are not supplied.
- Serviceability Engine: Resolves user PIN code to:
  - **Quick Local Delivery (10-30 min)** if a dark store covers the PIN code radius.
  - **Nationwide Delivery (1-3 days)** via courier partners if outside local zones.
  - Clear serviceability messaging if currently unserviceable.

### Phase 4: Lowest Price & Smart Pricing Engine
- Algorithm to select cheapest available supplier offer for customer's delivery location.
- Margin check to prevent selling below configured floor margin.
- Transparent price breakdown: MRP, Selling Price, Savings, Discount %, and "Best Price" badge.
- Price comparison component on product details page showing available supplier options.

### Phase 5: Fulfilment Centres, Dark Stores & Multi-Store Inventory
- Admin Fulfilment Centre management (manage dark stores, warehouses, delivery radii, working hours).
- Location-based inventory availability (inventory reflects selected fulfilment centre).
- Store capacity and dispatch slot management.

### Phase 6: Delivery Partner Fleet & Live Real-Time Tracking
- Delivery partner management in admin: vehicle types, phone numbers, assigned store, active status.
- Authenticated driver location update endpoint (`POST /api/driver/location`).
- Real-time customer delivery tracking with map marker, estimated ETA, route polyline, and status updates.

### Phase 7: Supplier Import Tools & Nationwide Courier Architecture
- CSV/JSON Supplier Product Catalogue Import tool with column mapping, duplicate detection, and validation.
- Courier partner integration abstraction (Shiprocket & Delhivery architecture).

### Phase 8: Enhanced Customer Marketplace Experience
- Redesigned header with live location pill and PIN code modal.
- Department mega-menu and subcategory filters.
- Variant selector pills on product cards and product details pages.
- "Buy Again" and Shopping Lists.
- Regional Indian Foods showcase.

### Phase 9: Admin Dashboard Marketplace Upgrades
- New modules: Marketplace Catalogue, Fulfilment Centres, Serviceable PIN Codes, Delivery Pricing Rules, Live Fleet Tracking, Supplier Imports.
- Nationwide operations analytics.

### Phase 10: Testing, Build Verification & Documentation
- Unit and integration tests for Serviceability, Variant pricing, Supplier comparison, and Location resolution.
- Verification of Next.js production build (`npm run build`).
- Documentation update: README.md, ARCHITECTURE.md, API_DOCUMENTATION.md, DATABASE_DOCUMENTATION.md, TEST_REPORT.md.
