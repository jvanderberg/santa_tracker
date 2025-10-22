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

## In Progress 🚧

### Geofence UX Improvements (TDD) - ✅ COMPLETED
- [x] Create client-side geofence utility library (client/src/lib/geofence.ts)
- [x] Write tests for geofence utilities (9/9 passing)
- [x] Write tests for geofence validation in SightingForm (9/9 passing)
- [x] Implement real-time geofence validation in SightingForm
  - Show warning message when location is outside geofence
  - Disable submit button when outside geofence
  - Display geofence boundary circle on map (semi-transparent red circle)
- [x] Update API error messages to be user-friendly (includes geoname and radius)
- [x] Add configurable geoname to build parameters (VITE_GEONAME / GEONAME)
- [x] Test and verify all geofence UX improvements

**Status:** All tests passing (32/32 frontend, 24/24 backend) ✅

**Goal:** Prevent geofence errors up front instead of showing generic "failed to create sighting" errors ✅

## Pending 📋

### Known Issues

None at this time! 🎉

### Frontend Components

- [ ] Create API client service with fetch wrapper
- [ ] Write tests and implement Header component
  - Time filter dropdown (Today, Yesterday, Date picker)
  - "Add Sighting" button
  - Title/logo
- [ ] Write tests and implement SightingForm component
  - Map click to set location
  - Datetime picker (defaults to now)
  - Details textarea
  - Submit handler with API integration
- [ ] Write tests and implement SightingMarker component
  - Custom marker icons (Santa themed)
  - Popup with sighting details
- [ ] Implement API integration in Map component
  - Fetch today's sightings on mount
  - Refresh on date filter change
- [ ] Write tests and implement date/time utilities
  - GMT to local time conversion
  - Local time to GMT conversion
  - Format display dates

### UI/UX Enhancements

- [x] Display geoname in app UI (Header showing configured location name under title)
- [ ] Add time-based filter controls (Last 1h, 4h, 12h, 24h default, All time)
- [ ] Add "Near Me" filter (0.5 mile radius from user's current location)
- [ ] Add current time display in legend (refresh with each data update)
- [ ] Format popup times: show "1h", "2h", etc. for sightings older than 60 minutes
- [ ] Add loading states for API calls
- [ ] Add error handling and user feedback
- [ ] Implement responsive mobile-first layout
- [ ] Add "Use Current Location" button in form
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

- **Backend Tests:** 24/24 passing ✅
- **Frontend Tests:** 33/33 passing ✅
- **Format/Lint:** All checks passing ✅
- **Pre-commit Hooks:** Enabled (tests + builds)
- **Deployment:** Live on Fly.io (configured for Oak Park, IL)
- **Node Version:** v22.21.0 (managed by nvm)
- **Recently Completed:**
  - Geoname display in Header component ✅
  - Monorepo Fly.io deployment with Docker build arguments for frontend env vars ✅

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
