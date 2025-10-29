import { useState } from 'react';
import { Map } from '../components/Map';
import { Header } from '../components/Header';
import { SightingForm } from '../components/SightingForm';
import { FilterPopup, type FilterOptions } from '../components/FilterPopup';
import { HelpPopup } from '../components/HelpPopup';
import { createSighting } from '../services/api';
import { useConfig } from '../contexts/ConfigContext';

export function MainPage() {
  const config = useConfig();
  const [showForm, setShowForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({ timeHours: 24, location: 'geofence' });

  const handleAddSighting = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleOpenFilter = () => {
    setShowFilter(true);
  };

  const handleCloseFilter = () => {
    setShowFilter(false);
  };

  const handleApplyFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleOpenHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handleSubmitSighting = async (data: {
    latitude: number;
    longitude: number;
    details: string;
  }) => {
    await createSighting({
      ...data,
      sighted_at: new Date().toISOString(),
      timezone: 'America/Chicago',
    });
    // Trigger map refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      <Header
        onAddSighting={handleAddSighting}
        onOpenFilter={handleOpenFilter}
        onOpenHelp={handleOpenHelp}
      />
      <div className="flex-1">
        <Map key={refreshKey} filters={filters} />
      </div>
      {showForm && <SightingForm onClose={handleCloseForm} onSubmit={handleSubmitSighting} />}
      {showFilter && (
        <FilterPopup
          onApply={handleApplyFilter}
          onClose={handleCloseFilter}
          initialFilters={filters}
          geoname={config.geoname}
        />
      )}
      {showHelp && <HelpPopup onClose={handleCloseHelp} geoname={config.geoname} />}
    </div>
  );
}
