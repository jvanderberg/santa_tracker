import { describe, it, expect } from 'vitest';
import { getGeofenceConfig, isWithinGeofence, calculateDistance } from './geofence';

describe('Geofence Utilities', () => {
  describe('getGeofenceConfig', () => {
    it('returns default geofence configuration', () => {
      const config = getGeofenceConfig();

      expect(config.centerLat).toBe(38.5);
      expect(config.centerLon).toBe(-117.0);
      expect(config.radiusMiles).toBe(3);
      expect(config.geoname).toBe('Springfield');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two points', () => {
      // Springfield to approximately 1 mile north
      const distance = calculateDistance(38.5, -117.0, 38.5145, -117.0);

      // Should be approximately 1 mile (within tolerance)
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });

    it('returns 0 for same point', () => {
      const distance = calculateDistance(38.5, -117.0, 38.5, -117.0);

      expect(distance).toBe(0);
    });
  });

  describe('isWithinGeofence', () => {
    it('returns true for location at center', () => {
      expect(isWithinGeofence(38.5, -117.0)).toBe(true);
    });

    it('returns true for location 1 mile from center', () => {
      // ~1 mile north of Springfield
      expect(isWithinGeofence(38.5145, -117.0)).toBe(true);
    });

    it('returns false for location 10 miles from center', () => {
      // ~10 miles north of Springfield
      expect(isWithinGeofence(38.645, -117.0)).toBe(false);
    });

    it('returns true for location just inside radius boundary', () => {
      // Calculate a point ~2.9 miles north
      // 1 degree latitude ≈ 69 miles, so 2.9 miles ≈ 0.042 degrees
      const lat = 38.5 + 0.042;
      expect(isWithinGeofence(lat, -117.0)).toBe(true);
    });

    it('returns false for location just outside radius boundary', () => {
      // Calculate a point ~3.1 miles north
      // 1 degree latitude ≈ 69 miles, so 3.1 miles ≈ 0.045 degrees
      const lat = 38.5 + 0.045;
      expect(isWithinGeofence(lat, -117.0)).toBe(false);
    });
  });
});
