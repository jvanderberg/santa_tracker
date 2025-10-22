import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose non-VITE_ prefixed env vars that match Fly secrets
    'import.meta.env.GEOFENCE_CENTER_LAT': JSON.stringify(process.env.GEOFENCE_CENTER_LAT),
    'import.meta.env.GEOFENCE_CENTER_LON': JSON.stringify(process.env.GEOFENCE_CENTER_LON),
    'import.meta.env.GEOFENCE_RADIUS_MILES': JSON.stringify(process.env.GEOFENCE_RADIUS_MILES),
    'import.meta.env.GEONAME': JSON.stringify(process.env.GEONAME),
  },
});
