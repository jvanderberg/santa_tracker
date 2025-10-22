import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function createAuthRouter(): Router {
  const router = Router();

  /**
   * POST /api/auth/admin
   * Authenticates admin with passphrase and returns JWT token
   */
  router.post('/admin', async (req: Request, res: Response): Promise<void> => {
    const { secret } = req.body;

    // Validate request
    if (!secret || typeof secret !== 'string') {
      res.status(400).json({ error: 'Secret is required' });
      return;
    }

    // Check if admin secret hash is configured
    const adminSecretHash = process.env.ADMIN_SECRET_HASH;
    if (!adminSecretHash) {
      console.error('ADMIN_SECRET_HASH not configured');
      res.status(500).json({ error: 'Admin authentication not configured' });
      return;
    }

    // Check if JWT secret is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Admin authentication not configured' });
      return;
    }

    try {
      // Verify passphrase
      const isValid = await bcrypt.compare(secret, adminSecretHash);

      if (!isValid) {
        res.status(401).json({ error: 'Invalid passphrase' });
        return;
      }

      // Generate JWT token (1 hour expiry)
      const token = jwt.sign({ admin: true }, jwtSecret, {
        expiresIn: '1h',
      });

      res.status(200).json({ token });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  return router;
}
