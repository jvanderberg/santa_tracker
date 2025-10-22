# Santa Tracker TODO

> **See DESIGN.md for comprehensive design documentation and specifications**

## Completed ✅

### Backend (Server)

- [x] Create project structure (server/ and client/ dirs)
- [x] Document requirements and TDD approach in .claude/CLAUDE.md
- [x] Create comprehensive design documentation (DESIGN.md)
- [x] Set up server with TypeScript, SQLite (TDD)
- [x] Write tests and implement database layer (11 tests passing)
- [x] Write tests and implement API endpoints (10 tests passing)
- [x] Configure Prettier + ESLint with build-time checks
- [x] Fix default behavior: GET /api/sightings returns today's sightings only
- [x] Implement 24-hour rolling window for default sighting retrieval
- [x] Fix DST bug in date/time filtering (now uses dynamic offset calculation)
- [x] Implement geofence validation (5-mile radius default, configurable via env vars)
- [x] Add Husky pre-commit hooks with test and build validation
- [x] Configure nvm in pre-commit hooks for Node version consistency

### Frontend (Client)

- [x] Set up React/Vite client with TypeScript
- [x] Install and configure Vitest + React Testing Library
- [x] Install Tailwind CSS v3 + shadcn/ui utilities
- [x] Install react-leaflet + Leaflet
- [x] Configure Prettier + ESLint with build-time checks
- [x] Write tests and implement Map component (TDD)
- [x] Upgrade Node.js to v22.21.0 via nvm
- [x] Fix iOS Safari header positioning with dynamic address bar
- [x] Add safe area inset support for iOS notch and home indicator

### Infrastructure

- [x] Add .gitignore file
- [x] Add .nvmrc for Node version management
- [x] Fix TypeScript `import type` issue with verbatimModuleSyntax
- [x] Deploy to Fly.io (backend and frontend)
- [x] Add restart.sh script for dev server management
- [x] Document error handling philosophy in CLAUDE.md

## Pending 📋

### Known Issues

None at this time! 🎉

### Frontend Components

- [x] Create API client service with fetch wrapper
- [x] Write tests and implement Header component
  - Filter button (sliders icon)
  - "Add Sighting" button (plus icon)
  - Title/logo with geoname display
- [x] Write tests and implement SightingForm component
  - Map click to set location
  - Real-time geofence validation
  - Details textarea
  - Submit handler with API integration
- [x] Write tests and implement custom marker component
  - Color-coded markers by age (red < 30min, orange < 1h, yellow 1-2h, blue > 2h)
  - Popup with sighting details and formatted time
- [x] Implement API integration in Map component
  - Fetch sightings on mount
  - Auto-refresh every 60 seconds
  - Apply client-side filters
- [x] Write tests and implement date/time utilities
  - GMT to local time conversion
  - Relative time formatting ("now", "5 min ago", "1h ago", "2d ago")
  - Current time display with AM/PM

### UI/UX Enhancements

- [x] Display geoname in app UI (Header showing configured location name under title)
- [x] Add time-based filter controls (Last 1h, 4h, 12h, 24h default) via FilterPopup
- [x] Add "Near Me" filter (0.25 mile radius from user's current location)
- [x] Add current time display in legend (@ 9:35 AM format, refreshes with data)
- [x] Format popup times: show "now", "5 min ago", "1h ago" instead of raw minutes
- [x] Add "Use Current Location" button in form
- [x] Implement responsive mobile-first layout with icon buttons
- [x] Fix client-side geofence validation to use fetched config
- [ ] Add loading states for API calls
- [ ] Add error handling and user feedback
- [ ] Implement heat map visualization for sighting density

### Backend Enhancements

- [ ] Add CORS configuration for local development
- [ ] Implement proper timezone library (luxon or date-fns-tz)
- [ ] Add request validation middleware
- [ ] Add logging middleware

### Testing & Documentation

- [ ] Increase frontend test coverage
- [ ] Add E2E tests with Playwright
- [ ] Create README.md with setup instructions
- [ ] Document API usage examples

### Deployment

- [ ] Configure production build
- [ ] Set up environment variables
- [ ] Create Docker configuration
- [ ] Deploy backend and frontend

## Notes

### Current Status

- **Backend Tests:** 25/25 passing ✅
- **Frontend Tests:** 54/54 passing ✅
- **Format/Lint:** All checks passing ✅
- **Pre-commit Hooks:** Enabled (tests + builds)
- **Deployment:** Live on Fly.io (configured for Oak Park, IL)
- **Node Version:** v22.21.0 (managed by nvm)
- **Recently Completed:**
  - Mobile-friendly filter popup with time and location filters ✅
  - Time formatting in map popups ("now", "5 min ago", "1h ago", etc.) ✅
  - Current time display in legend (updates with each refresh) ✅
  - Fixed geofence validation to use fetched config instead of defaults ✅
  - Added test to catch geofence config usage (TDD lesson learned) ✅

### Key Technical Decisions

- Using `import type` for all type-only imports (required by verbatimModuleSyntax)
- Tailwind CSS v3 (not v4) for stability
- shadcn/ui approach: copy components instead of package dependency
- All dates/times stored and transmitted as GMT/UTC
- Default filter: 24-hour rolling window (not calendar day)
- Geofence validation: 5-mile radius (configurable via GEOFENCE_* env vars)
- Geoname: Display name for location (configurable via VITE_GEONAME/GEONAME, default: "Oak Park, IL")
- iOS Safari: fixed positioning with safe area insets for notch support
- DST handling: dynamic offset calculation using toLocaleString()

### Architecture

- SPA with single route (/)
- Map-first mobile design
- Modal/sheet for sighting submission
- Real-time updates on form submission
