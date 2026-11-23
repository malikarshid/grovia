# GROVIA: INDIA-WIDE SERVICEABILITY & PINCODE ROUTING
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Service Implementation:** [`src/app/api/location/serviceability/route.ts`](src/app/api/location/serviceability/route.ts)  
**Database Model:** `ServiceablePinCode`

---

## 1. Serviceability Architecture

Every customer location preference or checkout address is validated against GROVIA's 6-digit Indian Postal Index Number (PIN) database.

### Delivery Modes
1. **`QUICK_LOCAL` (10-15 Min Instant Delivery):**
   - Serviced directly by proximity-based dark stores and dark store inventories.
   - Standard Delivery Fee: **₹30.00**
   - Free Delivery Threshold: **Orders of ₹499.00 and above**
2. **`NATIONWIDE` (2-4 Days Surface Express):**
   - Manifested through central fulfilment hubs (Nagpur Central Hub, etc.) via national couriers.
   - Standard Delivery Fee: **₹80.00**
   - Free Delivery Threshold: **Orders of ₹999.00 and above**
3. **`UNSERVICEABLE`:**
   - Clearly notified to the customer with an invitation to join the launch waitlist.

---

## 2. Verified Active Serviceable PIN Codes

| PIN Code | Area / Location | City | State | Mode | SLA |
|---|---|---|---|:---:|:---:|
| **110001** | Connaught Place, Barakhamba | New Delhi | Delhi | `QUICK_LOCAL` | 10-15 mins |
| **110016** | Hauz Khas, Green Park | New Delhi | Delhi | `QUICK_LOCAL` | 15-20 mins |
| **110024** | Defence Colony, Lajpat Nagar | New Delhi | Delhi | `QUICK_LOCAL` | 12-18 mins |
| **560038** | Indiranagar, HAL 2nd Stage | Bengaluru | Karnataka | `QUICK_LOCAL` | 10-15 mins |
| **560001** | MG Road, Brigade Road | Bengaluru | Karnataka | `QUICK_LOCAL` | 12-15 mins |
| **560034** | Koramangala, Ejipura | Bengaluru | Karnataka | `QUICK_LOCAL` | 10-15 mins |
| **400050** | Bandra West, Pali Hill | Mumbai | Maharashtra | `QUICK_LOCAL` | 12-18 mins |
| **400001** | Fort, Colaba, Marine Lines | Mumbai | Maharashtra | `QUICK_LOCAL` | 15-20 mins |
| **441108** | Hingna, MIDC Logistics Hub | Nagpur | Maharashtra | `NATIONWIDE` | 2-3 days |
| **500001** | Abids, Koti, Begum Bazaar | Hyderabad | Telangana | `NATIONWIDE` | 3-4 days |
| **600001** | George Town, Parrys | Chennai | Tamil Nadu | `NATIONWIDE` | 3-4 days |
| **700001** | BBD Bagh, Dalhousie Square | Kolkata | West Bengal | `NATIONWIDE` | 3-5 days |
