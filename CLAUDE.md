# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build (outputs to .next/standalone)
npm run lint     # Run ESLint
```

## Architecture

**Daylight Dashboard** is a Next.js 16 App Router dashboard for wall-mounted displays. It aggregates Google Calendar/Tasks/Sheets, Yahoo Finance, Open-Meteo weather, and optionally pi-monitor-proxied network stats and Ticketmaster events.

### Data flow

`page.tsx` is a **server component** that calls `lib/` functions directly in a `Promise.all` (calendar events, anniversaries, trips, family goals, quotes) and passes the results as props to client components — including `MonthlyCalendar`, which renders that same events/celebrations/trips data as a month grid rather than fetching independently. It also calls `readConfig()` to read `config.json` and passes location/feature flags as props — including the optional secondary and tertiary locations.

`layout.tsx` calls `getStocks()` which reads stock symbols from `config.json` via `readConfig()`.

**Client-side fetching** (components poll independently):
- `WelcomeHeader`, `WeatherCard`, `SecondaryClockWeather`, `TertiaryWeather` — fetch Open-Meteo directly using props for lat/lon/timezone
- `TodoList` — fetches `/api/tasks` every 60s
- `StockTicker` — when `connectivity.enabled`, also fetches `/api/connectivity` every 30s for the network-status readout (shown even if the stock list is empty)

### Config system

User preferences (location, enabled features, stock symbols) live in `config.json` at the project root. It's gitignored (can contain a real location) — `config.example.json` has the placeholder shape; `readConfig()` falls back to built-in defaults if the file is missing.

- `src/lib/config.ts` — `readConfig()`, `writeConfig()` and `sanitizeConfig()` (builds a complete typed config from arbitrary input, dropping unknown keys; used on both read and `POST /api/config`)
- `GET /api/config` — returns current config, unauthenticated (read by the dashboard, admin panel, and Docker healthcheck)
- `POST /api/config` — requires a valid `daylight_admin` session (see below), validates types, saves, and calls `revalidatePath('/', 'layout')` to flush the ISR cache (including the root layout's stock ticker / connectivity flag)
- In Docker, `config.json` must be mounted as a volume: `-v ./config.json:/app/config.json`

### Admin panel

- `/admin` — settings UI (city search, toggles, stock picker)
- `/admin/login` — password form; password set via `ADMIN_PASSWORD` env var
- `src/proxy.ts` — Next.js 16 proxy (replaces middleware) protecting `/admin/*` page routes
- `src/lib/adminSession.ts` — signs/verifies the `daylight_admin` cookie (`<expiry>.<HMAC over ADMIN_PASSWORD>`, 30-day expiry, Web Crypto so it works on both the Edge and Node.js runtimes). `/api/admin/login` rate-limits failed attempts in memory. `proxy.ts` and any mutating API route (`POST /api/config`) both call `isValidAdminSession()` — checking cookie *presence* alone is not sufficient, since page-only middleware doesn't cover `/api/*`.

### Key architectural decisions

- **Google auth**: OAuth2 with a long-lived refresh token. Auth is constructed inline in each `lib/` function.
- **Weather**: Open-Meteo API — free, no key required, returns timezone alongside coordinates from geocoding API.
- **ISR**: `revalidate = 300` on `layout.tsx` — this still matters for `/admin` and `/admin/login`, which are static ISR pages that inherit it (the layout renders `StockTicker` on every route). `page.tsx` itself is `force-dynamic` since config is read at request time, which overrides the layout's revalidate for `/` specifically.
- **OLED protection**: `ScreenWipe` flashes a full-screen black overlay every 5–10 minutes.
- **Hydration safety**: Components that can't know their value until after mount (`new Date()`, a `localStorage` cache read) return a placeholder div, or set state in an effect with a `react-hooks/set-state-in-effect` disable comment explaining why — see `MonthlyCalendar` and `EventsCarousel`.
- **Node version**: requires Node ≥22 (`yahoo-finance2`'s minimum supported runtime) — pinned in the Dockerfile and CI's `setup-node`. Don't downgrade without also patching around that warning.
