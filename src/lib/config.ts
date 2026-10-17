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
  display: {
    upcomingEventsCount: number;
    celebrationsCount: number;
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
  display: {
    upcomingEventsCount: 4,
    celebrationsCount: 3,
  },
};

const MIN_DISPLAY_COUNT = 1;
const MAX_DISPLAY_COUNT = 10;

// Coerce to a finite integer clamped to a sane range, falling back to the
// default's value — guards against a malformed config.json putting a
// non-numeric or out-of-range value into a .slice() downstream.
function coerceDisplayCount(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_DISPLAY_COUNT, Math.max(MIN_DISPLAY_COUNT, Math.round(n)));
}

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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function coerceSymbols(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((s) => typeof s === 'string') ? value : fallback;
}

// Builds a complete, well-typed config from arbitrary input: unknown keys are
// dropped and missing or wrongly-typed values fall back to the defaults. Used
// both when reading config.json and before writing a POSTed body to it.
export function sanitizeConfig(input: unknown): DashboardConfig {
  const parsed = asRecord(input);
  const d = DEFAULT_CONFIG;

  const location = (raw: unknown, fallback: LocationConfig): LocationConfig => {
    const r = asRecord(raw);
    return coerceLocation(
      {
        name: str(r.name, fallback.name),
        country: str(r.country, fallback.country),
        lat: r.lat as number,
        lon: r.lon as number,
        timezone: str(r.timezone, fallback.timezone),
      },
      fallback
    );
  };

  const optionalLocation = (raw: unknown, fallback: SecondaryLocationConfig): SecondaryLocationConfig => ({
    ...location(raw, fallback),
    enabled: asRecord(raw).enabled === true,
  });

  const display = asRecord(parsed.display);

  return {
    primaryLocation: location(parsed.primaryLocation, d.primaryLocation),
    secondaryLocation: optionalLocation(parsed.secondaryLocation, d.secondaryLocation),
    tertiaryLocation: optionalLocation(parsed.tertiaryLocation, d.tertiaryLocation),
    connectivity: {
      enabled: asRecord(parsed.connectivity).enabled === true,
    },
    stocks: { symbols: coerceSymbols(asRecord(parsed.stocks).symbols, d.stocks.symbols) },
    events: { enabled: asRecord(parsed.events).enabled === true },
    familyGoals: {
      enabled:
        typeof asRecord(parsed.familyGoals).enabled === 'boolean'
          ? (asRecord(parsed.familyGoals).enabled as boolean)
          : d.familyGoals.enabled,
    },
    display: {
      upcomingEventsCount: coerceDisplayCount(display.upcomingEventsCount, d.display.upcomingEventsCount),
      celebrationsCount: coerceDisplayCount(display.celebrationsCount, d.display.celebrationsCount),
    },
  };
}

export function readConfig(): DashboardConfig {
  let raw: string;
  try {
    raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  } catch {
    // Missing file is the normal first-run state — use defaults quietly.
    return DEFAULT_CONFIG;
  }

  try {
    return sanitizeConfig(JSON.parse(raw));
  } catch (e) {
    console.error(`config.json is not valid JSON, using defaults: ${(e as Error).message}`);
    return DEFAULT_CONFIG;
  }
}

export function writeConfig(config: DashboardConfig): void {
  const json = JSON.stringify(config, null, 2);
  const tmpPath = `${CONFIG_PATH}.tmp`;
  try {
    // Write-then-rename so a crash mid-write can't leave a truncated file.
    fs.writeFileSync(tmpPath, json, 'utf-8');
    fs.renameSync(tmpPath, CONFIG_PATH);
  } catch {
    // Rename fails (EBUSY) when config.json is a single-file Docker bind
    // mount, and the temp file can't be created if the directory isn't
    // writable — fall back to writing in place.
    try { fs.unlinkSync(tmpPath); } catch {}
    fs.writeFileSync(CONFIG_PATH, json, 'utf-8');
  }
}
