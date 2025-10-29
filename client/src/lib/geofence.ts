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
 * Get default geofence configuration
 * Defaults: Springfield (38.5, -117.0) with 3 mile radius
 * Note: In production, fetch actual config from /api/config
 */
export function getGeofenceConfig(): GeofenceConfig {
  return {
    centerLat: 38.5,
    centerLon: -117.0,
    radiusMiles: 3,
    geoname: 'Springfield',
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
