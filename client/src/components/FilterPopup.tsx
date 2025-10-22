import { useState } from 'react';

export interface FilterOptions {
  timeHours: 1 | 4 | 12 | 24;
  location: 'nearme' | 'geofence';
}

interface FilterPopupProps {
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
  initialFilters: FilterOptions;
  geoname: string;
}

export function FilterPopup({ onApply, onClose, initialFilters, geoname }: FilterPopupProps) {
  const [timeHours, setTimeHours] = useState<FilterOptions['timeHours']>(initialFilters.timeHours);
  const [location, setLocation] = useState<FilterOptions['location']>(initialFilters.location);

  const handleApply = () => {
    onApply({ timeHours, location });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-testid="filter-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Filter Sightings</h2>

        {/* Time Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Time</h3>
          <div className="space-y-3">
            {[
              { value: 1, label: 'Last hour' },
              { value: 4, label: 'Last 4 hours' },
              { value: 12, label: 'Last 12 hours' },
              { value: 24, label: 'Last 24 hours' },
            ].map(option => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="time"
                  value={option.value}
                  checked={timeHours === option.value}
                  onChange={() => setTimeHours(option.value as FilterOptions['timeHours'])}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <span className="text-base">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="location"
                value="nearme"
                checked={location === 'nearme'}
                onChange={() => setLocation('nearme')}
                className="w-5 h-5 text-red-600 focus:ring-red-500"
              />
              <span className="text-base">Near me (within 0.25 miles)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="location"
                value="geofence"
                checked={location === 'geofence'}
                onChange={() => setLocation('geofence')}
                className="w-5 h-5 text-red-600 focus:ring-red-500"
              />
              <span className="text-base">{geoname}</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-base"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
