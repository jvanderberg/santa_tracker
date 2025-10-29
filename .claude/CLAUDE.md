# Santa Tracker Project

## Development Approach

## ⚠️ STOP! READ THIS BEFORE ANY CODE CHANGES ⚠️

**ALL CODE MUST BE DEVELOPED USING STRICT RED/GREEN TDD**

### NEVER:
❌ Write code without tests first
❌ Make UI changes without updating tests
❌ Use Edit/Write tools before showing test updates
❌ Commit anything without running ALL tests
❌ Skip or defer test writing for "later"

### ALWAYS:
✅ Write failing test FIRST (RED)
✅ Show test failure output
✅ Write minimal code to pass (GREEN)
✅ Run tests and show results
✅ Refactor if needed (keeping tests green)

### Pre-Code Change Checklist
Before using Edit or Write tools, you MUST:
- [ ] Write/update the failing test
- [ ] Run tests to show the failure (RED)
- [ ] Write minimal code to pass the test
- [ ] Run tests to show success (GREEN)
- [ ] Verify ALL tests still pass (not just the new one)

**If you catch yourself about to edit code without updating tests first, STOP IMMEDIATELY.**

## Error Handling Philosophy
**PREVENT ERRORS UP FRONT, COMMUNICATE CLEARLY WHEN UNAVOIDABLE**

### Prevention First
- Validate and constrain input at the UI level before submission
- Disable submit buttons when data is invalid
- Provide real-time feedback on form fields
- Show visual indicators of constraints (e.g., geofence boundary on map)
- Use appropriate input types and constraints (min/max, required, pattern)

### Meaningful Error Messages
When errors cannot be prevented, communicate them clearly to users:
- **Simple language:** Avoid technical jargon ("You're outside the allowed area" not "Geofence validation failed")
- **Actionable:** Tell users what they need to do ("Move the marker closer to Oak Park")
- **Specific:** Explain the exact problem ("Location must be within 5 miles of Oak Park, IL")
- **Context-aware:** Show errors near where they occur (inline validation, not just generic alerts)

### Error Message Examples
- ❌ Bad: "Failed to create sighting"
- ✅ Good: "Location is outside the Oak Park area. Please select a location within 5 miles."

- ❌ Bad: "Invalid input"
- ✅ Good: "Please describe what you saw"

- ❌ Bad: "API error 400"
- ✅ Good: "Unable to submit sighting. Please check your connection and try again."

## Requirements

### Map Configuration
- Default center: Configurable via environment variables
- Default zoom level: 13
- Map library: Leaflet via react-leaflet

### Geofence
- Restricts sighting submissions to a configurable radius around a center point
- **All configuration is environment-based - no hardcoded locations**
- Configurable via environment variables:
  - `GEOFENCE_CENTER_LAT`: Center latitude (default: 38.5)
  - `GEOFENCE_CENTER_LON`: Center longitude (default: -117.0)
  - `GEOFENCE_RADIUS_MILES`: Radius in miles (default: 5)
  - `GEONAME` (server) / `VITE_GEONAME` (client): Display name for location (default: "Springfield")
- **Local Development**: Configure in `.env` files (gitignored)
- **Production**: Configure using Fly.io secrets (see Deployment section)
- Client-side validation: Shows warning and disables submit button when location is outside geofence
- Visual indicator: Displays semi-transparent red circle on location picker map showing geofence boundary
- Server-side validation: Returns 400 error with user-friendly message if location is outside geofence
- Uses Haversine formula for distance calculation

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

**Validation:**
- All required fields must be present
- Latitude and longitude must be numbers
- Location must be within configured geofence (returns 400 if outside)

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
**Response (201):**
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
**Error Response (400):**
```typescript
{
  error: string;  // e.g., "Location is outside the allowed geofence area"
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

**Root Cause:** better-sqlite3 is a native module that must be compiled for the specific Node.js version. When switching between Node versions or if the system Node differs from the nvm Node, the module needs to be rebuilt.

### Husky Pre-commit Hooks with nvm

**Critical:** Pre-commit hooks must source nvm to ensure consistent Node version (v22.21.0) across all environments.

In `.husky/pre-commit`:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npx lint-staged

# Run tests
cd client && npm test -- --run
cd ../server && npm test

# Run builds
cd ../client && npm run build
cd ../server && npm run build
```

Without sourcing nvm, the hooks will use the system Node version, which may cause better-sqlite3 compilation issues.

### DST (Daylight Saving Time) Handling

**Problem:** Hardcoded timezone offsets caused sightings to disappear after midnight during DST transitions.

**Solution:** Dynamic offset calculation using JavaScript's `toLocaleString()`:

```typescript
getTimezoneOffsetMs(date: Date, timezone: string): number {
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  return utcDate.getTime() - tzDate.getTime();
}
```

This approach automatically handles DST transitions without manual offset adjustments.

**Test Coverage:** DST tests verify correct behavior for dates before/after DST transitions (October dates in America/Chicago).

### iOS Safari Layout Issues

**Problem:** Header would intermittently appear under iOS Safari's dynamic address bar (50% failure rate on page refresh).

**Root Cause:** iOS Safari changes viewport height dynamically as the address bar shows/hides, and `100vh` is unreliable.

**Solution:**
1. **HTML:** Added `viewport-fit=cover` to meta tag for safe area support
2. **Body:** Changed to `position: fixed` with `overflow: hidden` to prevent viewport height changes
3. **Root element:** Applied safe area insets for notch and home indicator
4. **App container:** Changed from `h-screen` (100vh) to `fixed inset-0` for stable positioning

```css
body {
  position: fixed;
  width: 100%;
  overflow: hidden;
}

#root {
  height: 100%;
  width: 100%;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 24-Hour Rolling Window

**Decision:** Changed from calendar-day filtering to 24-hour rolling window for default view.

**Rationale:**
- Simpler implementation (no timezone conversions needed)
- More intuitive for users ("last 24 hours" vs "today in timezone X")
- Avoids DST edge cases for default view
- Calendar-day filtering still available via optional `date` parameter

**Implementation:**
```typescript
if (date) {
  // Use timezone-aware date filtering
} else {
  // Default: 24-hour rolling window
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  query += ' WHERE sighted_at >= ?';
  params.push(twentyFourHoursAgo.toISOString());
}
```

### Local Development Environment

**Setting up `.env` files (gitignored):**

Create `server/.env`:
```bash
# Geofence Configuration
GEOFENCE_CENTER_LAT=38.5
GEOFENCE_CENTER_LON=-117.0
GEOFENCE_RADIUS_MILES=5
GEONAME=Springfield
```

Create `client/.env`:
```bash
# Geofence Configuration
VITE_GEOFENCE_CENTER_LAT=38.5
VITE_GEOFENCE_CENTER_LON=-117.0
VITE_GEOFENCE_RADIUS_MILES=5
VITE_GEONAME=Springfield
```

**Note**: The server automatically loads `.env` in development mode via dotenv.

**Quick Start with `restart.sh`:**

The project includes a convenient restart script that handles the full development server lifecycle:

```bash
./restart.sh
```

What it does:
1. Stops any existing servers running on ports 3000 and 5173
2. Cleans build artifacts (`dist/` directories)
3. Installs/updates npm dependencies for both server and client
4. Starts the backend server (http://localhost:3000)
5. Waits 3 seconds for backend to initialize
6. Starts the frontend server (http://localhost:5173)
7. Displays process IDs for both servers

**To stop servers manually:**
```bash
lsof -ti :3000 :5173 | xargs kill -9
```

The script confirms environment variables are loaded with a dotenv message showing how many variables were injected.

### Deployment to Fly.io

This is a **monorepo deployment** - both frontend and backend deploy together in a single Dockerfile.

**Step 1: Set Backend Secrets (Runtime Configuration):**
```bash
# Set geofence configuration as secrets for the server
fly secrets set GEOFENCE_CENTER_LAT=41.8781 \
  GEOFENCE_CENTER_LON=-87.7846 \
  GEOFENCE_RADIUS_MILES=5 \
  GEONAME="Oak Park, IL" \
  NODE_ENV=production

# View current secrets (values are hidden)
fly secrets list
```

**Step 2: Deploy with Frontend Build Arguments:**

The frontend requires environment variables at **build time** (Vite bakes them into the JavaScript bundle). Pass them as Docker build arguments:

```bash
fly deploy \
  --build-arg VITE_GEOFENCE_CENTER_LAT=41.8781 \
  --build-arg VITE_GEOFENCE_CENTER_LON=-87.7846 \
  --build-arg VITE_GEOFENCE_RADIUS_MILES=5 \
  --build-arg VITE_GEONAME="Oak Park, IL"
```

**Important Notes:**
- Backend secrets (GEOFENCE_*) are runtime and can be changed without rebuilding
- Frontend secrets (VITE_*) are baked into the build and require redeployment to change
- Both must use the same coordinates for consistent behavior
- The Dockerfile accepts build arguments and passes them to Vite during the frontend build stage

**Database Persistence:**
- SQLite database stored in Fly volume at `/data/sightings.db`
- Volume `santa_data` is already configured in fly.toml
- Data persists across deployments

**Key Commands:**
```bash
# Monitor deployment
fly status
fly logs

# Manage secrets
fly secrets set KEY=value
fly secrets unset KEY
fly secrets list

# SSH into running app (for debugging)
fly ssh console

# Check database
fly ssh console -C "ls -la /data"
```

### Node Version Management

**Critical:** Project requires Node.js v22.21.0 (managed by nvm)

**.nvmrc:** Specifies Node version for automatic switching
```
22.21.0
```

**Usage:**
```bash
nvm use  # Automatically uses version from .nvmrc
```

**Why Node 22:**
- Modern TypeScript support
- Better performance for native modules
- Long-term support (LTS) version