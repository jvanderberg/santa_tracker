import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { Database } from './database';
import { createSightingsRouter } from './routes/sightings';
import { getGeofenceConfig } from './geofence';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
}

export let app: Express = express();
let db: Database;

export function initializeApp(dbPath: string = 'sightings.db'): Express {
  app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Initialize database
  db = new Database(dbPath);

  // API Routes
  app.use('/api/sightings', createSightingsRouter(db));

  // Config endpoint - returns geofence configuration
  app.get('/api/config', (_req: Request, res: Response): void => {
    const config = getGeofenceConfig();
    res.json(config);
  });

  // Serve static files from public directory (only in production)
  if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes
    app.use((req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  return app;
}

// Only start server if this file is run directly (not in tests)
if (require.main === module) {
  const dbPath = process.env.DB_PATH || 'sightings.db';
  initializeApp(dbPath);

  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`Santa Tracker API running on http://${HOST}:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});
