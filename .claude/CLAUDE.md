# Santa Tracker Project

## Development Approach
**ALL CODE MUST BE DEVELOPED USING STRICT RED/GREEN TDD**
- Write failing tests first (RED)
- Write minimal code to pass tests (GREEN)
- Refactor if needed
- No code without tests

## Requirements

### Map Configuration
- Default center: Oak Park, IL (41.8781° N, 87.7846° W)
- Default zoom level: 13
- Map library: Leaflet via react-leaflet

### Location Input
- Click on map to set location
- "Use Current Location" button (HTML5 geolocation)
- No text address input for now

### Sighting Form Fields
- Location (lat/lng from map interaction)
- Time (datetime picker, defaults to now)
- Details (free-form text area)
- Anonymous (no reporter info collected)

### Date/Time Handling
**CRITICAL: All dates/times stored and transmitted as GMT/UTC**
- Database: Store all timestamps in GMT
- API: Transmit all timestamps in GMT (ISO 8601 format)
- Frontend: Convert GMT to local time for display
- Frontend: Convert local time to GMT before sending to server
- Timezone: America/Chicago (Oak Park, IL) compiled into app

### Time Filtering
- Default: Show sightings from last 24 hours (rolling window)
- Optional: Filter by specific date in local timezone (uses DST-aware conversion)
- Future: Historical day research capability

### Data Storage
- SQLite database
- Schema:
  - id: INTEGER PRIMARY KEY
  - latitude: REAL NOT NULL
  - longitude: REAL NOT NULL
  - sighted_at: DATETIME NOT NULL
  - reported_at: DATETIME DEFAULT CURRENT_TIMESTAMP
  - details: TEXT

### Tech Stack
- Backend: Node.js/Express with strict TypeScript
- Frontend: React 18 + TypeScript + Vite
- Database: SQLite
- Testing: Jest (backend), Vitest (frontend)

## API Endpoints

### POST /api/sightings
Submit new sighting
**Request Body:**
```typescript
{
  latitude: number;
  longitude: number;
  sighted_at: string;  // ISO 8601 GMT timestamp
  details: string;
  timezone: string;    // IANA timezone (for context/logging)
}
```
**Response:**
```typescript
{
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;   // ISO 8601 GMT timestamp
  reported_at: string;  // ISO 8601 GMT timestamp
  details: string;
  sighted_age: number;  // Minutes since sighting (computed)
  reported_age: number; // Minutes since report (computed)
}
```

### GET /api/sightings
Get sightings with optional filtering
**Query Parameters:**
- `date` (optional): YYYY-MM-DD in local timezone
- `timezone` (optional): IANA timezone for date interpretation (defaults to "America/Chicago")
- If no date provided, returns sightings from the last 24 hours (rolling window)

**Response:**
```typescript
[
  {
    id: number;
    latitude: number;
    longitude: number;
    sighted_at: string;   // ISO 8601 GMT timestamp
    reported_at: string;  // ISO 8601 GMT timestamp
    details: string;
    sighted_age: number;  // Minutes since sighting (computed)
    reported_age: number; // Minutes since report (computed)
  },
  ...
]
```

### GET /api/sightings/:id
Get single sighting by id
**Response:**
```typescript
{
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;   // ISO 8601 GMT timestamp
  reported_at: string;  // ISO 8601 GMT timestamp
  details: string;
  sighted_age: number;  // Minutes since sighting (computed)
  reported_age: number; // Minutes since report (computed)
}
```

## Development Notes

### better-sqlite3 Native Module
If you encounter `NODE_MODULE_VERSION` mismatch errors with better-sqlite3:
```bash
cd server
npm rebuild better-sqlite3 --nodedir=$HOME/.nvm/versions/node/v22.21.0
```
This rebuilds the native module against the correct Node version (Node 22).