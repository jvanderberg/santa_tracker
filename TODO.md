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

### Frontend (Client)

- [x] Set up React/Vite client with TypeScript
- [x] Install and configure Vitest + React Testing Library
- [x] Install Tailwind CSS v3 + shadcn/ui utilities
- [x] Install react-leaflet + Leaflet
- [x] Configure Prettier + ESLint with build-time checks
- [x] Write tests and implement Map component (TDD)
- [x] Upgrade Node.js to v22.21.0 via nvm

### Infrastructure

- [x] Add .gitignore file
- [x] Add .nvmrc for Node version management
- [x] Fix TypeScript `import type` issue with verbatimModuleSyntax

## In Progress 🚧

- [ ] Fix Leaflet marker icons (broken in Vite)

## Pending 📋

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

- **Backend Tests:** 21/21 passing ✅
- **Frontend Tests:** 4/4 passing ✅
- **Format/Lint:** All checks passing ✅
- **Dev Server:** Running at http://localhost:5173/
- **Node Version:** v22.21.0 (managed by nvm)

### Key Technical Decisions

- Using `import type` for all type-only imports (required by verbatimModuleSyntax)
- Tailwind CSS v3 (not v4) for stability
- shadcn/ui approach: copy components instead of package dependency
- All dates/times stored and transmitted as GMT/UTC
- Default filter: today's sightings in America/Chicago timezone

### Architecture

- SPA with single route (/)
- Map-first mobile design
- Modal/sheet for sighting submission
- Real-time updates on form submission
