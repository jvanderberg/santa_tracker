import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { app, initializeApp } from '../server';

describe('API Endpoints', () => {
  const testDbPath = path.join(__dirname, 'test-api.db');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    initializeApp(testDbPath);
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('POST /api/sightings', () => {
    it('should create a new sighting', async () => {
      const sightingData = {
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Saw Santa on rooftop',
        timezone: 'America/Chicago',
      };

      const response = await request(app)
        .post('/api/sightings')
        .send(sightingData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.latitude).toBe(sightingData.latitude);
      expect(response.body.longitude).toBe(sightingData.longitude);
      expect(response.body.sighted_at).toBe(sightingData.sighted_at);
      expect(response.body.details).toBe(sightingData.details);
      expect(response.body.reported_at).toBeDefined();
      expect(response.body.sighted_age).toBeDefined();
      expect(response.body.reported_age).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        latitude: 41.8781,
        // missing longitude, sighted_at, details, timezone
      };

      await request(app).post('/api/sightings').send(invalidData).expect(400);
    });

    it('should return 400 for invalid latitude', async () => {
      const invalidData = {
        latitude: 'invalid',
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Test',
        timezone: 'America/Chicago',
      };

      await request(app).post('/api/sightings').send(invalidData).expect(400);
    });
  });

  describe('GET /api/sightings', () => {
    beforeEach(async () => {
      // Create test sightings
      await request(app)
        .post('/api/sightings')
        .send({
          latitude: 41.8781,
          longitude: -87.7846,
          sighted_at: new Date('2024-12-25T06:00:00Z').toISOString(),
          details: 'Morning sighting',
          timezone: 'America/Chicago',
        });

      await request(app)
        .post('/api/sightings')
        .send({
          latitude: 41.88,
          longitude: -87.79,
          sighted_at: new Date('2024-12-25T12:00:00Z').toISOString(),
          details: 'Afternoon sighting',
          timezone: 'America/Chicago',
        });

      await request(app)
        .post('/api/sightings')
        .send({
          latitude: 41.875,
          longitude: -87.78,
          sighted_at: new Date('2024-12-26T08:00:00Z').toISOString(),
          details: 'Next day sighting',
          timezone: 'America/Chicago',
        });
    });

    it("should return only today's sightings when no filter provided", async () => {
      // Add a sighting for today
      await request(app).post('/api/sightings').send({
        latitude: 41.88,
        longitude: -87.79,
        sighted_at: new Date().toISOString(),
        details: "Today's sighting",
        timezone: 'America/Chicago',
      });

      const response = await request(app)
        .get('/api/sightings')
        .expect('Content-Type', /json/)
        .expect(200);

      // Should only return today's sightings, not the ones from 2024-12-25/26
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(
        response.body.every((s: { details: string }) => s.details === "Today's sighting")
      ).toBe(true);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].sighted_age).toBeDefined();
      expect(response.body[0].reported_age).toBeDefined();
    });

    it('should filter sightings by date', async () => {
      const response = await request(app)
        .get('/api/sightings?date=2024-12-25&timezone=America/Chicago')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].details).toContain('Morning');
      expect(response.body[1].details).toContain('Afternoon');
    });

    it('should default to America/Chicago timezone', async () => {
      const response = await request(app)
        .get('/api/sightings?date=2024-12-25')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array for date with no sightings', async () => {
      const response = await request(app)
        .get('/api/sightings?date=2024-12-24&timezone=America/Chicago')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/sightings/:id', () => {
    let createdId: number;

    beforeEach(async () => {
      const response = await request(app).post('/api/sightings').send({
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        details: 'Test sighting',
        timezone: 'America/Chicago',
      });
      createdId = response.body.id;
    });

    it('should return a sighting by id', async () => {
      const response = await request(app)
        .get(`/api/sightings/${createdId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(createdId);
      expect(response.body.details).toBe('Test sighting');
      expect(response.body.sighted_age).toBeDefined();
      expect(response.body.reported_age).toBeDefined();
    });

    it('should return 404 for non-existent id', async () => {
      await request(app).get('/api/sightings/9999').expect(404);
    });

    it('should return 400 for invalid id', async () => {
      await request(app).get('/api/sightings/invalid').expect(400);
    });
  });
});
