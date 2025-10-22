import type { Sighting } from '../types';
import type { GeofenceConfig } from '../lib/geofence';

// In production, API is served from same origin. In dev, use separate port.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:3000/api`);

export interface SightingInput {
  latitude: number;
  longitude: number;
  sighted_at: string; // ISO 8601 GMT timestamp
  details: string;
  timezone: string; // IANA timezone
}

export async function getSightings(date?: string): Promise<Sighting[]> {
  const url = new URL(`${API_BASE_URL}/sightings`, window.location.origin);

  if (date) {
    url.searchParams.append('date', date);
    url.searchParams.append('timezone', 'America/Chicago');
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch sightings');
  }

  return response.json();
}

export async function createSighting(input: SightingInput): Promise<Sighting> {
  const response = await fetch(`${API_BASE_URL}/sightings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create sighting');
  }

  return response.json();
}

export async function getConfig(): Promise<GeofenceConfig> {
  const response = await fetch(`${API_BASE_URL}/config`);

  if (!response.ok) {
    throw new Error('Failed to fetch config');
  }

  return response.json();
}
