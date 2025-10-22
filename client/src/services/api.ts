import type { Sighting } from '../types';

// Use environment variable or fallback to window.location for network access
const API_BASE_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

export interface SightingInput {
  latitude: number;
  longitude: number;
  sighted_at: string; // ISO 8601 GMT timestamp
  details: string;
  timezone: string; // IANA timezone
}

export async function getSightings(date?: string): Promise<Sighting[]> {
  const url = new URL(`${API_BASE_URL}/sightings`);

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
