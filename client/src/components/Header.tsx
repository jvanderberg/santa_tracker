import { useConfig } from '../contexts/ConfigContext';

interface HeaderProps {
  onAddSighting: () => void;
  onOpenFilter: () => void;
  onOpenHelp: () => void;
}

export function Header({ onAddSighting, onOpenFilter, onOpenHelp }: HeaderProps) {
  const config = useConfig();

  return (
    <header className="bg-red-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Santa Tracker</h1>
          <p className="text-sm">{config.geoname}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenHelp}
            className="bg-white text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={onOpenFilter}
            className="bg-white text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Filter sightings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
          <button
            onClick={onAddSighting}
            className="bg-white text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Add sighting"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
