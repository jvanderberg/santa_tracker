# Santa Tracker 🎅

A real-time, crowdsourced Santa sighting tracker built with React and Node.js. Report and view Santa sightings on an interactive map during the holiday season!

## Features

- **Interactive Map**: View all Santa sightings on a Leaflet map
- **Real-time Updates**: Submit sightings and see them appear immediately
- **Geofence Protection**: Sightings restricted to a configurable geographic area (default: 5-mile radius)
- **Time-based Filtering**: View sightings from the last 24 hours (rolling window)
- **Mobile-First Design**: Optimized for iOS and Android with safe area support
- **Anonymous Reporting**: No login required - just click, describe, and submit

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v3
- react-leaflet (interactive maps)
- Vitest + React Testing Library

### Backend
- Node.js v22.21.0
- Express + TypeScript
- SQLite (better-sqlite3)
- Jest (testing)

### Infrastructure
- Husky (pre-commit hooks)
- Prettier + ESLint
- Fly.io (deployment)

## Getting Started

### Prerequisites

- Node.js v22.21.0 (managed via nvm)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/santa_tracker.git
cd santa_tracker
```

2. Use the correct Node version
```bash
nvm use
```

3. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

4. Configure local environment variables

Create `server/.env`:
```bash
# Geofence Configuration - customize for your location
GEOFENCE_CENTER_LAT=38.5
GEOFENCE_CENTER_LON=-117.0
GEOFENCE_RADIUS_MILES=5
GEONAME=Springfield
```

Create `client/.env`:
```bash
# Geofence Configuration - customize for your location
VITE_GEOFENCE_CENTER_LAT=38.5
VITE_GEOFENCE_CENTER_LON=-117.0
VITE_GEOFENCE_RADIUS_MILES=5
VITE_GEONAME=Springfield
```

5. Start the development servers

**Quick start** (recommended):
```bash
./restart.sh
```

This script will:
- Stop any existing servers on ports 3000 and 5173
- Clean build artifacts
- Install/update dependencies
- Start both backend and frontend servers
- Display process IDs for monitoring

**Manual start** (alternative):

In one terminal (server):
```bash
cd server
npm run dev
```

In another terminal (client):
```bash
cd client
npm run dev
```

The client will be available at http://localhost:5173 and the server at http://localhost:3000.

## Development Workflow

### Running Tests

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Pre-commit Hooks

The project uses Husky to run tests and builds before each commit. To ensure proper execution:

1. Hooks automatically source nvm to use Node v22.21.0
2. Runs `npm test` on both client and server
3. Runs `npm run build` on both client and server
4. Commit is blocked if any check fails

### Building for Production

```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

## Configuration

### Geofence Settings

The application restricts sightings to a configurable geographic area. All configuration is environment-based with no hardcoded locations.

**Local Development**: Create `.env` files in `server/` and `client/` directories (these files are gitignored).

**Server** (`server/.env`):
```bash
GEOFENCE_CENTER_LAT=38.5       # Center point latitude
GEOFENCE_CENTER_LON=-117.0     # Center point longitude
GEOFENCE_RADIUS_MILES=5        # Radius in miles
GEONAME=Springfield            # Display name for location
```

**Client** (`client/.env`):
```bash
VITE_GEOFENCE_CENTER_LAT=38.5
VITE_GEOFENCE_CENTER_LON=-117.0
VITE_GEOFENCE_RADIUS_MILES=5
VITE_GEONAME=Springfield
```

**Production**: Use Fly.io secrets (see Deployment section below).

## Deployment to Fly.io

This is a **monorepo deployment** - both frontend and backend deploy together in a single Docker container.

### Prerequisites

1. Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Authenticate: `fly auth login`

### Initial Setup (First Time Only)

1. Initialize Fly.io app from project root:
```bash
fly launch
```
Follow the prompts:
- Choose app name (e.g., `santa-tracker`)
- Select region closest to your users (default: `ord` for Chicago)
- Don't deploy yet - we need to configure first

2. Create a volume for database persistence:
```bash
fly volumes create santa_data --size 1
```

### Configure for Your Location

**Step 1: Set backend secrets (runtime configuration):**
```bash
fly secrets set GEOFENCE_CENTER_LAT=41.8781 \
  GEOFENCE_CENTER_LON=-87.7846 \
  GEOFENCE_RADIUS_MILES=5 \
  GEONAME="Oak Park, IL" \
  NODE_ENV=production
```

Replace coordinates with your location:
- Oak Park, IL: `41.8781, -87.7846`
- Springfield, NV: `38.5, -117.0`

**Step 2: Deploy with frontend build arguments:**

The frontend requires environment variables at **build time** (baked into the JavaScript bundle):

```bash
fly deploy \
  --build-arg VITE_GEOFENCE_CENTER_LAT=41.8781 \
  --build-arg VITE_GEOFENCE_CENTER_LON=-87.7846 \
  --build-arg VITE_GEOFENCE_RADIUS_MILES=5 \
  --build-arg VITE_GEONAME="Oak Park, IL"
```

**Important:** Frontend and backend coordinates must match!

### Managing Deployments

```bash
# Check app status
fly status

# View logs
fly logs

# SSH into the running app
fly ssh console

# Scale up/down
fly scale count 2

# View app info
fly info
```

### Database Persistence

The SQLite database is stored in a Fly.io volume at `/data/sightings.db`:
- Volume `santa_data` is already configured in `fly.toml`
- Data persists across deployments and restarts
- Volume is mounted at `/data` in the container
- The server is configured to use `/data/sightings.db` via the `DB_PATH` environment variable

## Troubleshooting

### better-sqlite3 Native Module Issues

If you encounter `NODE_MODULE_VERSION` mismatch errors:

```bash
cd server
npm rebuild better-sqlite3 --nodedir=$HOME/.nvm/versions/node/v22.21.0
```

This rebuilds the native module against the correct Node version.

### iOS Safari Header Issues

The app includes specific fixes for iOS Safari's dynamic address bar. If you see layout issues:

1. Ensure `viewport-fit=cover` is set in the meta tag
2. Body uses `position: fixed` with `overflow: hidden`
3. Safe area insets are applied to the root element

## Testing

- **Backend**: 24 tests covering database, API endpoints, and geofence validation
- **Frontend**: 20 tests covering components and user interactions
- **TDD Approach**: All features developed test-first (Red-Green-Refactor)

## Architecture

- **SPA**: Single-page application with one route
- **Mobile-First**: Optimized for mobile devices with responsive design
- **Real-time**: Form submission triggers immediate map refresh
- **UTC/GMT**: All timestamps stored and transmitted in GMT, converted to local time for display
- **Rolling Window**: Default view shows last 24 hours of sightings

## Contributing

This is a personal project, but suggestions and bug reports are welcome via issues.

## License

MIT

## Acknowledgments

- Built with strict TDD methodology
- Map tiles from OpenStreetMap contributors
- Deployed on Fly.io
