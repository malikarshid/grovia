# GROVIA: GOOGLE MAPS PLATFORM & LOCATION ARCHITECTURE
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Service Implementation:** [`src/services/mapsService.ts`](src/services/mapsService.ts)  
**API Endpoints:**
- `GET /api/location/distance` — Real driving distance or spherical Haversine computation
- `GET /api/driver/location` — Rider live telemetry broadcast
- `GET /api/driver/tracking/[orderId]` — Customer delivery tracking and route visualization

---

## 1. Executive Summary & Integration Status

GROVIA integrates Google Maps Platform for geolocation, dark store routing, and delivery telemetry while providing an offline mathematical fallback mechanism:
1. **Client/Server Secret Split:** The public Google Maps JavaScript API key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) is domain-restricted for frontend maps and address pickers, while the backend Distance Matrix and Geocoding keys (`GOOGLE_MAPS_SERVER_API_KEY`) remain strictly private.
2. **Haversine Spherical Mathematical Fallback:** When Google Maps server credentials are not configured, the platform computes great-circle distances using the Haversine formula with a 1.25 urban road-winding factor and 25 km/h EV bike speeds.
3. **No Fabricated Telemetry:** Real device coordinates (`navigator.geolocation`) are captured only with explicit user permission. When GPS is unavailable, the UI gracefully displays destination hubs without inventing artificial movement.

### Integration Status Matrix

| Capability | Status | Verification Evidence |
|---|:---:|---|
| **Location Modal & Address Picker** | **COMPLETE** | Interactive dialog with manual pincode / landmark entry and location auto-detect |
| **Haversine Distance Calculator** | **COMPLETE** | Verified via unit tests with real geographic coordinates |
| **Google Distance Matrix Client** | **COMPLETE** | Implemented with error boundaries and automatic fallback |
| **Rider GPS Telemetry API** | **COMPLETE** | Persists real rider coordinates (`currentLatitude`, `currentLongitude`) in `RiderProfile` |
| **Live Google Maps Key Integration** | **BLOCKED** | Active in fallback mode until valid Google Maps API keys are supplied |

---

## 2. Environment Configuration

To enable live Google Maps routing, add the following to `.env`:

```env
# Frontend Client Key (Restrict to your domain in Google Cloud Console)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyYourClientRestrictedKeyHere"

# Backend Server Key (Restrict by IP address)
GOOGLE_MAPS_SERVER_API_KEY="AIzaSyYourServerRestrictedKeyHere"
```
