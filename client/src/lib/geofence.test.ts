import { describe, it, expect } from 'vitest';
import { getGeofenceConfig, isWithinGeofence, calculateDistance } from './geofence';

describe('Geofence Utilities', () => {
  describe('getGeofenceConfig', () => {
    it('returns default geofence configuration', () => {
      const config = getGeofenceConfig();

      expect(config.centerLat).toBe(41.8781);
      expect(config.centerLon).toBe(-87.7846);
      expect(config.radiusMiles).toBe(5);
      expect(config.geoname).toBe('Oak Park, IL');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two points', () => {
      // Oak Park to approximately 1 mile north
      const distance = calculateDistance(41.8781, -87.7846, 41.8926, -87.7846);

      // Should be approximately 1 mile (within tolerance)
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });

    it('returns 0 for same point', () => {
      const distance = calculateDistance(41.8781, -87.7846, 41.8781, -87.7846);

      expect(distance).toBe(0);
    });
  });

  describe('isWithinGeofence', () => {
    it('returns true for location at center', () => {
      expect(isWithinGeofence(41.8781, -87.7846)).toBe(true);
    });

    it('returns true for location 1 mile from center', () => {
      // ~1 mile north of Oak Park
      expect(isWithinGeofence(41.8926, -87.7846)).toBe(true);
    });

    it('returns false for location 10 miles from center', () => {
      // ~10 miles north of Oak Park
      expect(isWithinGeofence(42.0231, -87.7846)).toBe(false);
    });

    it('returns true for location just inside radius boundary', () => {
      // Calculate a point ~4.9 miles north
      // 1 degree latitude ≈ 69 miles, so 4.9 miles ≈ 0.071 degrees
      const lat = 41.8781 + 0.071;
      expect(isWithinGeofence(lat, -87.7846)).toBe(true);
    });

    it('returns false for location just outside radius boundary', () => {
      // Calculate a point ~5.1 miles north
      // 1 degree latitude ≈ 69 miles, so 5.1 miles ≈ 0.074 degrees
      const lat = 41.8781 + 0.074;
      expect(isWithinGeofence(lat, -87.7846)).toBe(false);
    });
  });
});
