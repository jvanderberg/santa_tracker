/**
 * Geofence configuration and utilities (client-side)
 * Must match server-side configuration
 */

export interface GeofenceConfig {
  centerLat: number;
  centerLon: number;
  radiusMiles: number;
  geoname: string;
}

/**
 * Get geofence configuration
 * Defaults: Oak Park, IL (41.8781, -87.7846) with 5 mile radius
 */
export function getGeofenceConfig(): GeofenceConfig {
  return {
    centerLat: Number(import.meta.env.VITE_GEOFENCE_CENTER_LAT) || 41.8781,
    centerLon: Number(import.meta.env.VITE_GEOFENCE_CENTER_LON) || -87.7846,
    radiusMiles: Number(import.meta.env.VITE_GEOFENCE_RADIUS_MILES) || 5,
    geoname: import.meta.env.VITE_GEONAME || 'Oak Park, IL',
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is within the geofence
 */
export function isWithinGeofence(lat: number, lon: number, config?: GeofenceConfig): boolean {
  const geofence = config || getGeofenceConfig();
  const distance = calculateDistance(lat, lon, geofence.centerLat, geofence.centerLon);
  return distance <= geofence.radiusMiles;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
