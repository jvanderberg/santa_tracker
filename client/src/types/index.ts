export type Sighting = {
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string; // ISO 8601 GMT timestamp
  reported_at: string; // ISO 8601 GMT timestamp
  details: string;
  sighted_age: number; // Minutes since sighting
  reported_age: number; // Minutes since report
};
