import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Sighting } from '../types';
import { getSightings, getConfig } from '../services/api';
import { getGeofenceConfig, calculateDistance } from '../lib/geofence';
import { formatTimeAgo } from '../lib/timeFormat';
import { formatCurrentTime } from '../lib/formatCurrentTime';
import type { FilterOptions } from './FilterPopup';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

const DEFAULT_ZOOM = 13;
const NEAR_ME_RADIUS_MILES = 0.25;

// Get marker color based on sighting age in minutes
function getMarkerColor(ageMinutes: number): string {
  if (ageMinutes < 30) return '#ef4444'; // Red - less than 30 min
  if (ageMinutes < 60) return '#f97316'; // Orange - less than an hour
  if (ageMinutes < 120) return '#eab308'; // Yellow - 1-2 hours
  return '#3b82f6'; // Blue - older than 2 hours
}

// Create custom marker icon with color
function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
          fill="${color}"
          stroke="white"
          stroke-width="1.5"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

interface MapProps {
  sightings?: Sighting[];
  filters?: FilterOptions;
}

export function Map({ sightings: propSightings, filters }: MapProps) {
  const [fetchedSightings, setFetchedSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    getGeofenceConfig().centerLat,
    getGeofenceConfig().centerLon,
  ]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(formatCurrentTime(new Date()));

  // Fetch config to set map center
  useEffect(() => {
    getConfig()
      .then(config => setMapCenter([config.centerLat, config.centerLon]))
      .catch(() => {
        // Silently fall back to default if API fails
      });
  }, []);

  useEffect(() => {
    // Only fetch if no sightings were provided via props
    if (propSightings !== undefined) {
      return;
    }

    const fetchData = async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await getSightings();
        setFetchedSightings(data);
        // Update current time when data is refreshed
        setCurrentTime(formatCurrentTime(new Date()));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sightings');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    // Initial fetch with loading indicator
    fetchData(true);

    // Set up auto-refresh every 60 seconds (silent, no loading indicator)
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [propSightings]);

  // Get user location when "near me" filter is active
  useEffect(() => {
    if (filters?.location === 'nearme' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userLoc);
          // Recenter map on user location
          setMapCenter([userLoc.lat, userLoc.lng]);
        },
        error => {
          // Handle location permission errors gracefully
          console.error('Location error:', error);
          setUserLocation(null);
          // Show a non-intrusive error - don't block the entire map
          if (error.code === error.PERMISSION_DENIED) {
            alert(
              'Location permission denied. Please enable location services in your browser to use "Near me" filter.'
            );
          } else {
            alert('Unable to get your location. Please try the location filter again.');
          }
        }
      );
    } else if (filters?.location === 'nearme' && !('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
    }
  }, [filters?.location]);

  const sightings = propSightings ?? fetchedSightings;

  // Apply filters to sightings
  const filteredSightings = sightings.filter(sighting => {
    // Time filter
    const timeHours = filters?.timeHours ?? 24;
    const timeMinutes = timeHours * 60;
    if (sighting.sighted_age > timeMinutes) {
      return false;
    }

    // Location filter
    if (filters?.location === 'nearme' && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        sighting.latitude,
        sighting.longitude
      );
      if (distance > NEAR_ME_RADIUS_MILES) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p>Loading sightings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-600">Failed to load sightings: {error}</p>
      </div>
    );
  }

  return (
    <div data-testid="map-container" className="h-full w-full relative">
      <MapContainer
        key={`${mapCenter[0]}-${mapCenter[1]}`}
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredSightings.map(sighting => {
          const markerColor = getMarkerColor(sighting.sighted_age);
          const markerIcon = createColoredIcon(markerColor);

          return (
            <Marker
              key={sighting.id}
              position={[sighting.latitude, sighting.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{sighting.details}</p>
                  <p className="text-sm text-gray-600">{formatTimeAgo(sighting.sighted_age)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div
        className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs"
        style={{ zIndex: 1000 }}
      >
        <div className="font-semibold mb-2">@ {currentTime}</div>
        <div className="pb-2 mb-2 border-b border-gray-200">
          <div className="font-semibold mb-1">Sighting Age</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span>&lt; 30 min</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span>&lt; 1 hour</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
            <span>1-2 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span>&gt; 2 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
