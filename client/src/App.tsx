import { useState } from 'react';
import { Map } from './components/Map';
import { Header } from './components/Header';
import { SightingForm } from './components/SightingForm';
import { createSighting } from './services/api';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSighting = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
      <Header onAddSighting={handleAddSighting} />
      <div className="flex-1">
        <Map key={refreshKey} />
      </div>
      {showForm && <SightingForm onClose={handleCloseForm} onSubmit={handleSubmitSighting} />}
    </div>
  );
}

export default App;
