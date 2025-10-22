# Santa Tracker - Design Document

## Overview
A community Santa sighting tracker for Oak Park, IL. Users can report Santa sightings with location, time, and details. All sightings are displayed on an interactive heat map.

## Development Philosophy
**STRICT RED/GREEN TDD REQUIRED**
- Write failing tests first (RED)
- Write minimal code to pass tests (GREEN)
- Refactor if needed
- No code without tests

## Architecture

### Tech Stack
**Backend:**
- Node.js with Express
- TypeScript (strict mode)
- SQLite database (better-sqlite3)
- Jest + Supertest for testing

**Frontend:**
- React 18 with TypeScript (strict mode)
- Vite for bundling/dev server
- Leaflet.js via react-leaflet for maps
- Vitest + React Testing Library for testing

**Project Structure:**
```
santa_tracker/
├── server/
│   ├── src/
│   │   ├── server.ts           # Express app setup
│   │   ├── database.ts         # SQLite operations
│   │   ├── routes/
│   │   │   └── sightings.ts    # API route handlers
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   └── __tests__/
│   │       ├── database.test.ts
│   │       └── api.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── client/                      # TODO: To be created
└── .claude/
    └── CLAUDE.md               # Project-specific requirements
```

## Database Schema

### Table: `sightings`
```sql
CREATE TABLE sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  sighted_at TEXT NOT NULL,        -- ISO 8601 GMT timestamp
  reported_at TEXT NOT NULL,       -- ISO 8601 GMT timestamp (auto-generated)
  details TEXT
);
```

**Notes:**
- All timestamps stored in GMT/UTC
- No timezone information stored in database
- Age calculations performed at query time

## API Specification

### Base URL
`http://localhost:3000/api`

### Endpoints

#### 1. POST /api/sightings
Submit a new Santa sighting.

**Request Body:**
```typescript
{
  latitude: number;        // e.g., 41.8781
  longitude: number;       // e.g., -87.7846
  sighted_at: string;      // ISO 8601 GMT: "2024-12-25T06:00:00.000Z"
  details: string;         // Free-form text
  timezone: string;        // IANA timezone: "America/Chicago"
}
```

**Response (201 Created):**
```typescript
{
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;      // ISO 8601 GMT
  reported_at: string;     // ISO 8601 GMT
  details: string;
  sighted_age: number;     // Minutes since sighting (computed)
  reported_age: number;    // Minutes since report (computed)
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid fields
- `500 Internal Server Error` - Database error

#### 2. GET /api/sightings
Get list of sightings with optional date filtering.

**Query Parameters:**
- `date` (optional): YYYY-MM-DD format in local timezone (e.g., "2024-12-25")
- `timezone` (optional): IANA timezone (defaults to "America/Chicago")

**Examples:**
- `/api/sightings` - All sightings
- `/api/sightings?date=2024-12-25` - Dec 25 in Chicago timezone
- `/api/sightings?date=2024-12-25&timezone=America/New_York` - Dec 25 in NY timezone

**Response (200 OK):**
```typescript
[
  {
    id: number;
    latitude: number;
    longitude: number;
    sighted_at: string;
    reported_at: string;
    details: string;
    sighted_age: number;
    reported_age: number;
  },
  ...
]
```

#### 3. GET /api/sightings/:id
Get a single sighting by ID.

**Parameters:**
- `id`: Integer sighting ID

**Response (200 OK):**
```typescript
{
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;
  reported_at: string;
  details: string;
  sighted_age: number;
  reported_age: number;
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Sighting doesn't exist
- `500 Internal Server Error` - Database error

## Date/Time Handling

**CRITICAL: All dates/times in GMT/UTC**

### Storage & Transmission
- Database: All timestamps in GMT (ISO 8601 format)
- API: All timestamps transmitted as GMT (ISO 8601 format)
- Timezone sent with POST for context/logging only

### Frontend Conversions
- Display: Convert GMT → Local time (America/Chicago)
- Submit: Convert Local time → GMT before sending to API
- Timezone: "America/Chicago" compiled into frontend app

### Date Filtering
When user filters by date (e.g., "2024-12-25"):
1. Client sends date in YYYY-MM-DD format + timezone
2. Server converts to GMT range:
   - Start: 2024-12-25 00:00:00 Chicago → 2024-12-25 06:00:00 GMT
   - End: 2024-12-26 00:00:00 Chicago → 2024-12-26 06:00:00 GMT
3. Query database with GMT range

### Age Calculations
Computed at query time (not stored):
```typescript
sighted_age = floor((now_gmt - sighted_at_gmt) / 60_000)  // minutes
reported_age = floor((now_gmt - reported_at_gmt) / 60_000)  // minutes
```

## Frontend Requirements

### Map Configuration
- **Center:** Oak Park, IL (41.8781° N, 87.7846° W)
- **Default Zoom:** 13
- **Library:** Leaflet.js via react-leaflet
- **Visualization:** Heat map overlay for sighting density

### Location Input Methods
1. **Click on Map:** User clicks map to set location
2. **Current Location Button:** Use HTML5 geolocation API
3. **No text address input** (may add geocoding later)

### Sighting Submission Form
**Fields:**
- Location (lat/lng) - Selected via map interaction
- Time (datetime picker) - Defaults to current time
- Details (textarea) - Free-form text description
- Anonymous - No reporter information collected

**Validation:**
- Location required (must click map or use current location)
- Time required (but pre-filled with now)
- Details required (minimum 3 characters?)
- Timezone auto-set to "America/Chicago"

### Time Filtering
- **Default:** Show only today's sightings (in local timezone)
- **UI:** Dropdown or date picker for historical research
- Options: "Today", "Yesterday", "Last 7 days", "All time", or date picker

### Map Display
- Show all filtered sightings on map
- Heat map intensity based on sighting concentration
- Clickable markers showing:
  - Time of sighting (in local time)
  - Age (e.g., "15 minutes ago")
  - Details text
  - Location coordinates

### Responsive Design
- Mobile-friendly (sighting reports from phones)
- Map should adapt to screen size
- Form should be easy to use on mobile

## TypeScript Types

### Shared Types (used by both client and server)
```typescript
// Sighting object returned by API
interface Sighting {
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;   // ISO 8601 GMT
  reported_at: string;  // ISO 8601 GMT
  details: string;
  sighted_age: number;  // minutes
  reported_age: number; // minutes
}

// Data sent when creating a sighting
interface SightingInput {
  latitude: number;
  longitude: number;
  sighted_at: string;   // ISO 8601 GMT
  details: string;
  timezone: string;     // IANA timezone
}

// Database row (before age computation)
interface SightingRow {
  id: number;
  latitude: number;
  longitude: number;
  sighted_at: string;
  reported_at: string;
  details: string;
}
```

## Testing Strategy

### Backend Testing (Jest + Supertest)
**Database Layer Tests (11 tests):**
- Table creation and initialization
- Creating sightings with validation
- Retrieving all sightings
- Filtering by date/timezone
- Retrieving by ID
- Age field computation
- Edge cases (missing data, invalid IDs)

**API Layer Tests (10 tests):**
- POST endpoint validation and creation
- GET all sightings
- GET with date/timezone filters
- GET by ID with error handling
- Request validation (400 errors)
- Not found handling (404 errors)

**Current Status:** ✅ All 21 tests passing

### Frontend Testing (Vitest + React Testing Library)
**TODO:** To be implemented
- Component rendering
- User interactions (map clicks, form submission)
- API integration mocks
- Date/time conversion logic
- Error handling and edge cases

## Implementation Status

### ✅ Completed
- [x] Project structure created
- [x] Design documentation
- [x] Backend TypeScript/Express setup
- [x] SQLite database with schema
- [x] Database layer with full test coverage (11 tests)
- [x] API endpoints with full test coverage (10 tests)
- [x] Date/time GMT handling
- [x] Age field calculations

### 🚧 In Progress
- [ ] React/Vite frontend setup

### 📋 Pending
- [ ] Frontend routing and layout
- [ ] Leaflet map component
- [ ] Sighting submission form
- [ ] API integration layer
- [ ] Date/time conversion utilities (GMT ↔ Local)
- [ ] Time filtering UI
- [ ] Heat map visualization
- [ ] Testing frontend components
- [ ] Error handling and loading states
- [ ] Deployment configuration

## Running the Application

### Backend (Development)
```bash
cd server
npm install
npm run dev          # Start dev server on port 3000
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run build       # Compile TypeScript
npm start           # Run compiled production build
```

### Frontend (TODO)
```bash
cd client
npm install
npm run dev         # Start Vite dev server
npm test           # Run tests
npm run build      # Build for production
```

## Future Enhancements
- User authentication (optional)
- Admin panel for moderation
- Upvote/verification system
- Real-time updates (WebSocket/SSE)
- Photo uploads
- Sighting categories (on roof, in sky, heard bells, etc.)
- Export data (CSV, JSON)
- Statistics dashboard
- Mobile app (React Native)
- Multiple community support (beyond Oak Park)

## Notes
- Keep this document updated as implementation progresses
- All design decisions should be documented here
- Use TODO.md for task tracking
- Use .claude/CLAUDE.md for AI-specific instructions
