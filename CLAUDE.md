# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build (outputs to .next/standalone)
npm run lint     # Run ESLint
```

## Architecture

**Daylight Dashboard** is a Next.js 16 App Router dashboard for wall-mounted displays. It aggregates Google Calendar/Tasks/Sheets, Yahoo Finance, Open-Meteo weather, and optionally UniFi network data and Ticketmaster events.

### Data flow

`page.tsx` is a **server component** that calls `lib/` functions directly in a `Promise.all` and passes data as props to client components. It also calls `readConfig()` to read `config.json` and passes location/feature flags as props.

`layout.tsx` calls `getStocks()` which reads stock symbols from `config.json` via `readConfig()`.

**Client-side fetching** (components poll independently):
- `WelcomeHeader`, `WeatherCard`, `SecondaryClockWeather` — fetch Open-Meteo directly using props for lat/lon/timezone
- `TodoList` — fetches `/api/tasks` every 60s
- `ConnectivityWidget` — fetches `/api/connectivity` every 30s (only rendered when `config.connectivity.enabled`)

### Config system

User preferences (location, enabled features, stock symbols) live in `config.json` at the project root.

- `src/lib/config.ts` — `readConfig()` and `writeConfig()` with typed schema and safe defaults
- `GET /api/config` — returns current config
- `POST /api/config` — validates, saves, and calls `revalidatePath('/')` to flush ISR cache
- In Docker, `config.json` must be mounted as a volume: `-v ./config.json:/app/config.json`

### Admin panel

- `/admin` — settings UI (city search, toggles, stock picker)
- `/admin/login` — password form; password set via `ADMIN_PASSWORD` env var
- `src/proxy.ts` — Next.js 16 proxy (replaces middleware) protecting `/admin/*` routes

### Key architectural decisions

- **Google auth**: OAuth2 with a long-lived refresh token. Auth is constructed inline in each `lib/` function.
- **Weather**: Open-Meteo API — free, no key required, returns timezone alongside coordinates from geocoding API.
- **ISR**: `revalidate = 3600` on page, `revalidate = 300` on layout. Overridden to `force-dynamic` on page since config is read at request time.
- **OLED protection**: `ScreenWipe` flashes a full-screen black overlay every 5–10 minutes.
- **Hydration safety**: Components using `new Date()` return a placeholder div until after mount.
