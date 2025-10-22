import { useState, useEffect } from 'react';
import { getConfig } from '../services/api';
import { getGeofenceConfig } from '../lib/geofence';

interface HeaderProps {
  onAddSighting: () => void;
}

export function Header({ onAddSighting }: HeaderProps) {
  const [geoname, setGeoname] = useState(getGeofenceConfig().geoname);

  useEffect(() => {
    getConfig()
      .then(config => setGeoname(config.geoname))
      .catch(() => {
        // Silently fall back to default if API fails
      });
  }, []);

  return (
    <header className="bg-red-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Santa Tracker</h1>
          <p className="text-sm">{geoname}</p>
        </div>
        <button
          onClick={onAddSighting}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          Add Sighting
        </button>
      </div>
    </header>
  );
}
