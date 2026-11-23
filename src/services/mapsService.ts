/**
 * GROVIA Google Maps Platform & Geolocation Service
 * Supports client-side map rendering alongside server-side Geocoding,
 * Distance Matrix, and offline Haversine mathematical fallback.
 */

export interface GeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  pincode: string;
}

export interface DistanceCalculationResult {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  distanceKm: number;
  durationMinutes: number;
  provider: 'GOOGLE_MAPS' | 'HAVERSINE_SPHERICAL_FALLBACK';
}

export class MapsService {
  /**
   * Check whether Google Maps server API key is configured
   */
  static isConfigured(): boolean {
    const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    return Boolean(key && key.trim().length > 10);
  }

  /**
   * Calculate great-circle distance between two GPS coordinates using the Haversine formula
   */
  static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Calculate driving distance and estimated time
   */
  static async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceCalculationResult> {
    const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;

    if (!key || !this.isConfigured()) {
      // Calculate realistic road estimation using Haversine with a 1.25 urban winding factor
      const straightDistance = this.calculateHaversineDistance(originLat, originLng, destLat, destLng);
      const roadDistanceKm = parseFloat((straightDistance * 1.25).toFixed(2));
      // Average 25 km/h urban EV bike delivery speed (2.4 mins per km) + 3 min pickup buffer
      const estimatedMinutes = Math.max(8, Math.round(roadDistanceKm * 2.4 + 3));

      return {
        origin: { latitude: originLat, longitude: originLng },
        destination: { latitude: destLat, longitude: destLng },
        distanceKm: roadDistanceKm,
        durationMinutes: estimatedMinutes,
        provider: 'HAVERSINE_SPHERICAL_FALLBACK',
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&key=${key}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const elem = data.rows[0].elements[0];
        const distKm = parseFloat((elem.distance.value / 1000).toFixed(2));
        const durMin = Math.round(elem.duration.value / 60);

        return {
          origin: { latitude: originLat, longitude: originLng },
          destination: { latitude: destLat, longitude: destLng },
          distanceKm: distKm,
          durationMinutes: durMin,
          provider: 'GOOGLE_MAPS',
        };
      }
    } catch (e) {
      console.warn('Google Distance Matrix call failed, falling back to Haversine:', e);
    }

    // Fallback if API response was not OK
    const straightDistance = this.calculateHaversineDistance(originLat, originLng, destLat, destLng);
    return {
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng },
      distanceKm: parseFloat((straightDistance * 1.25).toFixed(2)),
      durationMinutes: Math.max(8, Math.round(straightDistance * 3)),
      provider: 'HAVERSINE_SPHERICAL_FALLBACK',
    };
  }
}
