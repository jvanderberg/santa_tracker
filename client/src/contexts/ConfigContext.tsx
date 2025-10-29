import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getGeofenceConfig, type GeofenceConfig } from '../lib/geofence';
import { getConfig } from '../services/api';

const ConfigContext = createContext<GeofenceConfig | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<GeofenceConfig>(getGeofenceConfig());

  useEffect(() => {
    let cancelled = false;

    getConfig()
      .then(fetchedConfig => {
        if (!cancelled) {
          setConfig(fetchedConfig);
        }
      })
      .catch(() => {
        // Silently fall back to default if API fails
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig(): GeofenceConfig {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
