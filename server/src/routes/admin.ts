import { Router, Request, Response } from 'express';
import { verifyAdminToken } from '../middleware/auth';

export function createAdminRouter(): Router {
  const router = Router();

  // Apply admin token verification to all routes in this router
  router.use(verifyAdminToken);

  /**
   * GET /api/admin/test
   * Test endpoint to verify admin authentication
   */
  router.get('/test', (_req: Request, res: Response): void => {
    res.status(200).json({ message: 'Admin authentication successful' });
  });

  return router;
}
