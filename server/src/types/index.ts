export interface Sighting {
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string; // ISO 8601 GMT timestamp
  reported_at: string; // ISO 8601 GMT timestamp
  details: string;
  sighted_age: number; // Minutes since sighting
  reported_age: number; // Minutes since report
}

export interface SightingInput {
  latitude: number;
  longitude: number;
  sighted_at: string; // ISO 8601 GMT timestamp
  details: string;
  timezone: string; // IANA timezone
}

export interface SightingRow {
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;
  reported_at: string;
  details: string;
}
