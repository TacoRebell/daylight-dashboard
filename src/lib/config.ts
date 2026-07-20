import fs from 'fs';
import path from 'path';

export interface LocationConfig {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface SecondaryLocationConfig extends LocationConfig {
  enabled: boolean;
}

export interface DashboardConfig {
  primaryLocation: LocationConfig;
  secondaryLocation: SecondaryLocationConfig;
  tertiaryLocation: SecondaryLocationConfig;
  connectivity: {
    enabled: boolean;
  };
  stocks: {
    symbols: string[];
  };
  events: {
    enabled: boolean;
  };
  familyGoals: {
    enabled: boolean;
  };
}

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

const DEFAULT_CONFIG: DashboardConfig = {
  primaryLocation: {
    name: 'New York',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
  },
  secondaryLocation: {
    enabled: false,
    name: '',
    country: '',
    lat: 0,
    lon: 0,
    timezone: '',
  },
  tertiaryLocation: {
    enabled: false,
    name: '',
    country: '',
    lat: 0,
    lon: 0,
    timezone: '',
  },
  connectivity: {
    enabled: false,
  },
  stocks: {
    symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
  },
  events: {
    enabled: false,
  },
  familyGoals: {
    enabled: true,
  },
};

// Coerce lat/lon to finite numbers, falling back to the default's values —
// guards against a malformed config.json putting a non-numeric value into a
// fetch URL template string downstream.
function coerceLocation<T extends LocationConfig>(merged: T, fallback: T): T {
  const lat = Number(merged.lat);
  const lon = Number(merged.lon);
  return {
    ...merged,
    lat: Number.isFinite(lat) ? lat : fallback.lat,
    lon: Number.isFinite(lon) ? lon : fallback.lon,
  };
}

export function readConfig(): DashboardConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // Merge with defaults so missing keys don't crash the app
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      primaryLocation: coerceLocation(
        { ...DEFAULT_CONFIG.primaryLocation, ...parsed.primaryLocation },
        DEFAULT_CONFIG.primaryLocation
      ),
      secondaryLocation: coerceLocation(
        { ...DEFAULT_CONFIG.secondaryLocation, ...parsed.secondaryLocation },
        DEFAULT_CONFIG.secondaryLocation
      ),
      tertiaryLocation: coerceLocation(
        { ...DEFAULT_CONFIG.tertiaryLocation, ...parsed.tertiaryLocation },
        DEFAULT_CONFIG.tertiaryLocation
      ),
      connectivity: { ...DEFAULT_CONFIG.connectivity, ...parsed.connectivity },
      stocks: { ...DEFAULT_CONFIG.stocks, ...parsed.stocks },
      events: { ...DEFAULT_CONFIG.events, ...parsed.events },
      familyGoals: { ...DEFAULT_CONFIG.familyGoals, ...parsed.familyGoals },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function writeConfig(config: DashboardConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
