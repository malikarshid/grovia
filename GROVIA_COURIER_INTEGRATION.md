# GROVIA: COURIER & LOGISTICS INTEGRATION GUIDE
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Service Implementation:** [`src/services/courierService.ts`](src/services/courierService.ts)  
**API Endpoints:**
- `GET /api/logistics/track/[awb]` — AWB tracking timeline & checkpoint updates
- `POST /api/orders` — Automatic shipment manifestation for nationwide destinations

---

## 1. Executive Summary & Architecture

GROVIA operates a multi-speed delivery network across India:
1. **Quick Commerce (10 to 15 Minutes):** Hyperlocal delivery serviced by GROVIA dark store hubs (Connaught Place, Indiranagar, Bandra, etc.) using dedicated electric vehicle (EV) riders.
2. **Nationwide Surface Express (2 to 5 Days):** Servicing non-local serviceable pin codes across Tier-1, Tier-2, and Tier-3 cities via integrated logistics partners:
   - **Delhivery Surface Express:** High-volume interstate ground logistics.
   - **Shiprocket Multi-Carrier Adapter:** Automated rate shopping and courier aggregation.

### Integration Status Matrix

| Logistics Feature | Status | Verification Evidence |
|---|:---:|---|
| **Pincode Routing Engine** | **COMPLETE** | Automatically routes local PINs to quick delivery and interstate PINs to courier shipment |
| **AWB Manifesting Engine** | **COMPLETE** | Generates compliant AWB numbers and creates `Shipment` records in database |
| **Tracking Timeline & Checkpoints** | **COMPLETE** | Detailed multi-checkpoint status timeline (`MANIFESTED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`) |
| **Live Delhivery & Shiprocket APIs** | **BLOCKED** | Runs in compliant simulator mode until live API tokens are configured |

---

## 2. Environment Configuration

To connect live logistics partner accounts, configure:

```env
# Delhivery Express API
DELHIVERY_API_TOKEN="your_delhivery_production_token"

# Shiprocket B2C Logistics
SHIPROCKET_API_EMAIL="logistics@grovia.in"
SHIPROCKET_API_PASSWORD="your_secure_shiprocket_password"
```
