import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSightings,
  createSighting,
  getConfig,
  adminLogin,
  testAdminAuth,
  deleteSighting,
} from './api';
import type { Sighting } from '../types';
import type { GeofenceConfig } from '../lib/geofence';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSightings', () => {
    it('fetches sightings for today by default', async () => {
      const mockSightings: Sighting[] = [
        {
          id: 1,
          latitude: 41.8781,
          longitude: -87.7846,
          sighted_at: new Date().toISOString(),
          reported_at: new Date().toISOString(),
          details: 'Test sighting',
          sighted_age: 10,
          reported_age: 5,
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSightings,
      });

      const result = await getSightings();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/sightings');
      expect(result).toEqual(mockSightings);
    });

    it('fetches sightings for a specific date', async () => {
      const mockSightings: Sighting[] = [];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSightings,
      });

      const result = await getSightings('2024-12-25');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/sightings?date=2024-12-25&timezone=America%2FChicago'
      );
      expect(result).toEqual(mockSightings);
    });

    it('throws an error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getSightings()).rejects.toThrow('Failed to fetch sightings');
    });
  });

  describe('createSighting', () => {
    it('creates a new sighting', async () => {
      const newSighting = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'New sighting',
        timezone: 'America/Chicago',
      };

      const createdSighting: Sighting = {
        id: 1,
        ...newSighting,
        reported_at: new Date().toISOString(),
        sighted_age: 0,
        reported_age: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => createdSighting,
      });

      const result = await createSighting(newSighting);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/sightings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSighting),
      });
      expect(result).toEqual(createdSighting);
    });

    it('throws an error when creation fails', async () => {
      const newSighting = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'New sighting',
        timezone: 'America/Chicago',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(createSighting(newSighting)).rejects.toThrow('Failed to create sighting');
    });
  });

  describe('getConfig', () => {
    it('fetches geofence configuration', async () => {
      const mockConfig: GeofenceConfig = {
        centerLat: 41.8781,
        centerLon: -87.7846,
        radiusMiles: 3,
        geoname: 'Oak Park, IL',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const result = await getConfig();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/config');
      expect(result).toEqual(mockConfig);
    });

    it('throws an error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getConfig()).rejects.toThrow('Failed to fetch config');
    });
  });

  describe('adminLogin', () => {
    it('returns token with valid passphrase', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adminLogin('test-passphrase');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret: 'test-passphrase' }),
      });
      expect(result).toBe('mock-jwt-token');
    });

    it('throws an error with invalid passphrase', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(adminLogin('wrong-passphrase')).rejects.toThrow('Invalid passphrase');
    });
  });

  describe('testAdminAuth', () => {
    it('returns true with valid token', async () => {
      const mockResponse = {
        message: 'Admin authentication successful',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await testAdminAuth('mock-jwt-token');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/test', {
        headers: {
          Authorization: 'Bearer mock-jwt-token',
        },
      });
      expect(result).toBe(true);
    });

    it('returns false with invalid token', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await testAdminAuth('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('deleteSighting', () => {
    it('deletes sighting with valid token', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await deleteSighting(123, 'mock-jwt-token');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/sightings/123'),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        })
      );
    });

    it('throws error when delete fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(deleteSighting(123, 'mock-jwt-token')).rejects.toThrow(
        'Failed to delete sighting'
      );
    });
  });
});
