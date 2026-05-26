"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardConfig, LocationConfig } from '@/lib/config';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  country_code: string;
  admin1?: string;
}

// ── LocationSearch ─────────────────────────────────────────────────────────────

function LocationSearch({
  value,
  onChange,
}: {
  value: LocationConfig;
  onChange: (loc: LocationConfig) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en`
        );
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const select = (r: GeoResult) => {
    onChange({
      name: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
      country: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
      timezone: r.timezone,
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Current selection */}
      {value.name && (
        <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl border border-white/20">
          <div className="text-white/40 text-xl">📍</div>
          <div>
            <div className="text-white font-medium">{value.name}</div>
            <div className="text-white/40 text-sm font-mono">
              {value.timezone} &middot; {value.lat.toFixed(4)}, {value.lon.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={value.name ? 'Search to change city…' : 'Search for a city…'}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
            Searching…
          </span>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-[#111d35] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {results.map(r => (
            <button
              key={r.id}
              onMouseDown={() => select(r)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="text-white font-medium">
                {r.name}{r.admin1 ? `, ${r.admin1}` : ''}
              </div>
              <div className="text-white/40 text-sm">
                {r.country} &middot; {r.timezone}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StockPicker ────────────────────────────────────────────────────────────────

function StockPicker({
  symbols,
  onChange,
}: {
  symbols: string[];
  onChange: (s: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = useCallback(() => {
    const sym = input.trim().toUpperCase().replace(/[^A-Z.^-]/g, '');
    if (sym && !symbols.includes(sym)) {
      onChange([...symbols, sym]);
    }
    setInput('');
  }, [input, symbols, onChange]);

  return (
    <div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem]">
        {symbols.length === 0 && (
          <span className="text-white/30 text-sm py-1">No symbols added yet.</span>
        )}
        {symbols.map(sym => (
          <span
            key={sym}
            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white/10 rounded-full border border-white/15 text-white text-sm font-mono font-medium"
          >
            {sym}
            <button
              onClick={() => onChange(symbols.filter(s => s !== sym))}
              className="text-white/40 hover:text-white transition-colors leading-none text-base w-4 h-4 flex items-center justify-center"
              aria-label={`Remove ${sym}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. AAPL  — press Enter to add"
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-mono transition-colors"
          maxLength={10}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="px-5 py-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-start gap-4 w-full text-left group"
    >
      <div
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors mt-0.5 ${
          checked ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/15'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </div>
      <div>
        <div className="text-white font-medium leading-6">{label}</div>
        {description && (
          <div className="text-white/40 text-sm mt-0.5">{description}</div>
        )}
      </div>
    </button>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className="text-white font-semibold text-lg mb-1">{title}</h2>
      <p className="text-white/40 text-sm mb-6">{description}</p>
      {children}
    </section>
  );
}

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setConfig)
      .catch(() => setLoadError('Failed to load config. Is the server running?'));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ ok: true, message: 'Saved. Dashboard will reflect changes shortly.' });
      } else {
        setSaveStatus({ ok: false, message: data.error || 'Save failed.' });
      }
    } catch {
      setSaveStatus({ ok: false, message: 'Network error.' });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">
        {loadError}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/30 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-6 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Settings</h1>
          <p className="text-white/40 text-sm mt-1">
            Changes apply to the dashboard immediately after saving.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <a
            href="/"
            className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Dashboard
          </a>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Primary Location */}
        <Section
          title="Primary Location"
          description="City shown in the main clock, weather card, and UV index at the top of the dashboard."
        >
          <LocationSearch
            value={config.primaryLocation}
            onChange={loc => setConfig({ ...config, primaryLocation: loc })}
          />
        </Section>

        {/* Secondary Location */}
        <Section
          title="Secondary Location"
          description="Optional second city shown in column 1 — useful for tracking weather and time for a remote family member or a second home."
        >
          <div className="mb-5">
            <Toggle
              checked={config.secondaryLocation.enabled}
              onChange={v =>
                setConfig({
                  ...config,
                  secondaryLocation: { ...config.secondaryLocation, enabled: v },
                })
              }
              label="Enable second city"
            />
          </div>

          {config.secondaryLocation.enabled && (
            <LocationSearch
              value={config.secondaryLocation}
              onChange={loc =>
                setConfig({
                  ...config,
                  secondaryLocation: { ...config.secondaryLocation, ...loc },
                })
              }
            />
          )}
        </Section>

        {/* Connectivity Monitor */}
        <Section
          title="Internet Connectivity"
          description="Shows live latency, packet loss, and uptime pulled from a Ubiquiti UniFi network controller."
        >
          <Toggle
            checked={config.connectivity.enabled}
            onChange={v =>
              setConfig({ ...config, connectivity: { enabled: v } })
            }
            label="Show connectivity monitor"
            description="Requires UNIFI_API_KEY to be set in your environment file."
          />
        </Section>

        {/* Stock Ticker */}
        <Section
          title="Stock Ticker"
          description="Symbols displayed in the scrolling ticker at the bottom of the dashboard. Data is sourced from Yahoo Finance — no API key required."
        >
          <StockPicker
            symbols={config.stocks.symbols}
            onChange={symbols => setConfig({ ...config, stocks: { symbols } })}
          />
        </Section>

        {/* Events Carousel */}
        <Section
          title="Events Carousel"
          description="Full-width carousel at the bottom of the dashboard showing upcoming live music events via the Ticketmaster API."
        >
          <Toggle
            checked={config.events.enabled}
            onChange={v => setConfig({ ...config, events: { enabled: v } })}
            label="Show events carousel"
            description="Requires TICKETMASTER_API_KEY to be set in your environment file."
          />
        </Section>

      </div>

      {/* Save bar */}
      <div className="mt-8 flex items-center gap-4 flex-wrap">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {saveStatus && (
          <span
            className={`text-sm ${saveStatus.ok ? 'text-green-400' : 'text-red-400'}`}
          >
            {saveStatus.message}
          </span>
        )}
      </div>

    </div>
  );
}
