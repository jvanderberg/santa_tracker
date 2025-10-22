import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { app, initializeApp } from '../server';
import * as fs from 'fs';
import * as path from 'path';

describe('Auth Endpoints', () => {
  const testDbPath = path.join(__dirname, 'test-auth.db');
  let testPasswordHash: string;

  beforeAll(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    initializeApp(testDbPath);

    // Create a test password hash
    testPasswordHash = await bcrypt.hash('test-passphrase', 10);
    // Set the test hash in environment
    process.env.ADMIN_SECRET_HASH = testPasswordHash;
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    delete process.env.ADMIN_SECRET_HASH;
    delete process.env.JWT_SECRET;
  });

  describe('POST /api/auth/admin', () => {
    it('should return 200 and JWT token with valid passphrase', async () => {
      const response = await request(app)
        .post('/api/auth/admin')
        .send({ secret: 'test-passphrase' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');

      // Verify the token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!);
      expect(decoded).toHaveProperty('admin');
      expect((decoded as jwt.JwtPayload & { admin: boolean }).admin).toBe(true);
    });

    it('should return 401 with invalid passphrase', async () => {
      const response = await request(app)
        .post('/api/auth/admin')
        .send({ secret: 'wrong-passphrase' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.token).toBeUndefined();
    });

    it('should return 400 when secret is missing', async () => {
      const response = await request(app)
        .post('/api/auth/admin')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 500 when ADMIN_SECRET_HASH is not configured', async () => {
      const originalHash = process.env.ADMIN_SECRET_HASH;
      delete process.env.ADMIN_SECRET_HASH;

      const response = await request(app)
        .post('/api/auth/admin')
        .send({ secret: 'test-passphrase' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.error).toBeDefined();

      // Restore
      process.env.ADMIN_SECRET_HASH = originalHash;
    });
  });

  describe('GET /api/admin/test', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const response = await request(app)
        .post('/api/auth/admin')
        .send({ secret: 'test-passphrase' });

      validToken = response.body.token;
    });

    it('should return 200 with valid JWT token', async () => {
      const response = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/admin/test')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/test')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 with expired token', async () => {
      // Create an expired token with -1 second expiry (already expired)
      const expiredToken = jwt.sign({ admin: true }, process.env.JWT_SECRET!, {
        expiresIn: -1,
      });

      const response = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
});
