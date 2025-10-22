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

/**
 * Admin authentication - login with passphrase
 * Returns JWT token on success
 */
export async function adminLogin(passphrase: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret: passphrase }),
  });

  if (!response.ok) {
    throw new Error('Invalid passphrase');
  }

  const data = await response.json();
  return data.token;
}

/**
 * Test admin authentication with token
 * Returns true if token is valid, false otherwise
 */
export async function testAdminAuth(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/admin/test`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
}

/**
 * Delete a sighting (admin only)
 * Returns true on success, throws error on failure
 */
export async function deleteSighting(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sightings/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete sighting');
  }
}
