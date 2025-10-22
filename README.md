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

4. Start the development servers

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

The application restricts sightings to a configurable geographic area. Configure via environment variables:

```bash
# Server environment variables
GEOFENCE_CENTER_LAT=41.8781    # Center point latitude
GEOFENCE_CENTER_LON=-87.7846   # Center point longitude
GEOFENCE_RADIUS_MILES=5        # Radius in miles
```

Default: Oak Park, IL (41.8781°N, 87.7846°W) with a 5-mile radius.

## Deployment to Fly.io

### Prerequisites

1. Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Authenticate: `fly auth login`

### Deploy Backend

1. Navigate to the server directory:
```bash
cd server
```

2. Initialize Fly.io app (first time only):
```bash
fly launch
```
Follow the prompts:
- Choose app name (e.g., `santa-tracker-api`)
- Select region closest to your users
- Don't deploy yet - we need to configure first

3. Set environment variables:
```bash
fly secrets set GEOFENCE_CENTER_LAT=41.8781
fly secrets set GEOFENCE_CENTER_LON=-87.7846
fly secrets set GEOFENCE_RADIUS_MILES=5
fly secrets set NODE_ENV=production
```

4. Deploy:
```bash
fly deploy
```

5. Note your API URL (e.g., `https://santa-tracker-api.fly.dev`)

### Deploy Frontend

1. Navigate to the client directory:
```bash
cd client
```

2. Update the API endpoint in your client code to point to your deployed backend URL

3. Initialize Fly.io app:
```bash
fly launch
```

4. Deploy:
```bash
fly deploy
```

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

The SQLite database is stored in the container and will persist across restarts but may be lost on redeployments. For production use, consider:

1. Using Fly.io volumes for persistence:
```bash
fly volumes create santa_data --size 1
```

2. Update `fly.toml` to mount the volume:
```toml
[mounts]
  source = "santa_data"
  destination = "/data"
```

3. Update server to use `/data/sightings.db` as the database path

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
