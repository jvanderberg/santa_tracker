import { Router, Request, Response } from 'express';
import { Database } from '../database';
import { SightingInput } from '../types';
import { isWithinGeofence, getGeofenceConfig } from '../geofence';

export function createSightingsRouter(db: Database): Router {
  const router = Router();
  const geofenceConfig = getGeofenceConfig();

  // POST /api/sightings
  router.post('/', (req: Request, res: Response): void => {
    try {
      const { latitude, longitude, sighted_at, details, timezone } = req.body;

      // Validate required fields
      if (
        latitude === undefined ||
        longitude === undefined ||
        !sighted_at ||
        !details ||
        !timezone
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate types
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({ error: 'Invalid latitude or longitude' });
        return;
      }

      if (typeof sighted_at !== 'string' || typeof details !== 'string') {
        res.status(400).json({ error: 'Invalid sighted_at or details' });
        return;
      }

      // Validate geofence
      if (!isWithinGeofence(latitude, longitude)) {
        res.status(400).json({
          error: `Location is outside the ${geofenceConfig.geoname} area (${geofenceConfig.radiusMiles} mile radius)`,
        });
        return;
      }

      const input: SightingInput = {
        latitude,
        longitude,
        sighted_at,
        details,
        timezone,
      };

      const sighting = db.createSighting(input);
      res.status(201).json(sighting);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/sightings
  router.get('/', (req: Request, res: Response): void => {
    try {
      const date = req.query.date as string | undefined;
      const timezone = (req.query.timezone as string) || 'America/Chicago';

      const sightings = db.getSightings(date, timezone);
      res.status(200).json(sightings);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/sightings/:id
  router.get('/:id', (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const sighting = db.getSightingById(id);

      if (!sighting) {
        res.status(404).json({ error: 'Sighting not found' });
        return;
      }

      res.status(200).json(sighting);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
