import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { Database } from '../database';
import { Sighting, SightingInput } from '../types';

describe('Database', () => {
  let db: Database;
  const testDbPath = path.join(__dirname, 'test.db');

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('initialization', () => {
    it('should create a database file', () => {
      expect(fs.existsSync(testDbPath)).toBe(true);
    });

    it('should create sightings table', () => {
      const tableExists = db.tableExists('sightings');
      expect(tableExists).toBe(true);
    });
  });

  describe('createSighting', () => {
    it('should insert a new sighting and return it with computed ages', () => {
      const input: SightingInput = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Saw Santa on rooftop',
        timezone: 'America/Chicago',
      };

      const sighting = db.createSighting(input);

      expect(sighting.id).toBeGreaterThan(0);
      expect(sighting.latitude).toBe(input.latitude);
      expect(sighting.longitude).toBe(input.longitude);
      expect(sighting.sighted_at).toBe(input.sighted_at);
      expect(sighting.details).toBe(input.details);
      expect(sighting.reported_at).toBeDefined();
      expect(typeof sighting.sighted_age).toBe('number');
      expect(typeof sighting.reported_age).toBe('number');
      expect(sighting.reported_age).toBeLessThanOrEqual(1); // Should be nearly 0 minutes
    });

    it('should auto-generate reported_at timestamp', () => {
      const beforeInsert = new Date();

      const input: SightingInput = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Heard sleigh bells',
        timezone: 'America/Chicago',
      };

      const sighting = db.createSighting(input);
      const reportedAt = new Date(sighting.reported_at);
      const afterInsert = new Date();

      expect(reportedAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
      expect(reportedAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
    });
  });

  describe('getSightings', () => {
    beforeEach(() => {
      // Insert test data
      db.createSighting({
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date('2024-12-25T06:00:00Z').toISOString(),
        details: 'Morning sighting',
        timezone: 'America/Chicago',
      });

      db.createSighting({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: new Date('2024-12-25T12:00:00Z').toISOString(),
        details: 'Afternoon sighting',
        timezone: 'America/Chicago',
      });

      db.createSighting({
        latitude: 41.875,
        longitude: -87.78,
        sighted_at: new Date('2024-12-26T08:00:00Z').toISOString(),
        details: 'Next day sighting',
        timezone: 'America/Chicago',
      });
    });

    it('should return only sightings from the last 24 hours when no date filter is provided', () => {
      const now = Date.now();

      // Create sightings at different relative times
      db.createSighting({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        details: '1 hour ago',
        timezone: 'America/Chicago',
      });

      db.createSighting({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: new Date(now - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
        details: '23 hours ago',
        timezone: 'America/Chicago',
      });

      db.createSighting({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: new Date(now - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago (should be excluded)
        details: '25 hours ago',
        timezone: 'America/Chicago',
      });

      const sightings = db.getSightings();

      // Should only return sightings from last 24 hours (2), not the 25-hour-old one or the 3 from beforeEach
      expect(sightings).toHaveLength(2);
      expect(sightings.find(s => s.details === '1 hour ago')).toBeDefined();
      expect(sightings.find(s => s.details === '23 hours ago')).toBeDefined();
      expect(sightings.find(s => s.details === '25 hours ago')).toBeUndefined();
    });

    it('should return sightings for a specific date in given timezone', () => {
      // Dec 25, 2024 in America/Chicago is 2024-12-25T06:00:00Z to 2024-12-26T05:59:59Z
      const sightings = db.getSightings('2024-12-25', 'America/Chicago');
      expect(sightings).toHaveLength(2);
      expect(sightings[0].details).toContain('Morning');
      expect(sightings[1].details).toContain('Afternoon');
    });

    it('should return empty array when no sightings match date filter', () => {
      const sightings = db.getSightings('2024-12-24', 'America/Chicago');
      expect(sightings).toHaveLength(0);
    });

    it('should include computed age fields', () => {
      const sightings = db.getSightings('2024-12-25', 'America/Chicago');
      sightings.forEach((sighting: Sighting) => {
        expect(typeof sighting.sighted_age).toBe('number');
        expect(typeof sighting.reported_age).toBe('number');
        expect(sighting.sighted_age).toBeGreaterThanOrEqual(0);
        expect(sighting.reported_age).toBeGreaterThanOrEqual(0);
      });
    });

    it('should correctly handle DST for October dates in America/Chicago', () => {
      // Oct 22, 2025 in America/Chicago (CDT, UTC-5)
      // Midnight CDT = 05:00:00 UTC
      // Create sightings just after midnight CDT
      db.createSighting({
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: '2025-10-22T05:10:00.000Z', // 12:10am CDT
        details: 'Just after midnight CDT',
        timezone: 'America/Chicago',
      });

      db.createSighting({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: '2025-10-22T04:50:00.000Z', // 11:50pm CDT previous day
        details: 'Before midnight CDT',
        timezone: 'America/Chicago',
      });

      const sightings = db.getSightings('2025-10-22', 'America/Chicago');
      expect(sightings).toHaveLength(1);
      expect(sightings[0].details).toBe('Just after midnight CDT');
    });
  });

  describe('getSightingById', () => {
    it('should return a sighting by id', () => {
      const input: SightingInput = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Test sighting',
        timezone: 'America/Chicago',
      };

      const created = db.createSighting(input);
      const retrieved = db.getSightingById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.latitude).toBe(input.latitude);
      expect(retrieved!.longitude).toBe(input.longitude);
      expect(retrieved!.details).toBe(input.details);
    });

    it('should return undefined for non-existent id', () => {
      const sighting = db.getSightingById(9999);
      expect(sighting).toBeUndefined();
    });

    it('should include computed age fields', () => {
      const input: SightingInput = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Test sighting',
        timezone: 'America/Chicago',
      };

      const created = db.createSighting(input);
      const retrieved = db.getSightingById(created.id);

      expect(retrieved!.sighted_age).toBeDefined();
      expect(retrieved!.reported_age).toBeDefined();
      expect(typeof retrieved!.sighted_age).toBe('number');
      expect(typeof retrieved!.reported_age).toBe('number');
    });
  });
});
