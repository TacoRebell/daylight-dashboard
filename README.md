# Daylight Dashboard

A self-hosted family dashboard designed for wall-mounted displays and dedicated tablets. Aggregates weather, calendar events, tasks, goals, stocks, and more into a high-contrast, glanceable interface optimized for viewing from a distance.

Built with Next.js 16, deployable via Docker, and configurable through a built-in web admin panel — no code edits required after setup.

![Dashboard preview](public/bg.jpg)

---

## Features

| Section | Description | Service |
|---|---|---|
| **Clock & Weather** | Large clock, current conditions, UV index, 5-day forecast | Open-Meteo (free, no key) |
| **Second City** | Optional second clock and weather card for a remote location | Open-Meteo |
| **Goals** | Card-based goals list | Google Sheets |
| **To-Dos** | Interactive task list with priority colours | Google Tasks |
| **Events** | Upcoming calendar events (14-day window) | Google Calendar |
| **Celebrations** | Anniversary notifications (90-day window) | Google Calendar |
| **Trip Planner** | Countdown cards for upcoming trips | Google Calendar |
| **Stock Ticker** | Infinite-scrolling ticker pinned to the bottom | Yahoo Finance (no key) |
| **Events Carousel** | Upcoming live music events | Ticketmaster API |
| **Connectivity** | Live latency, packet loss, and uptime | UniFi Network Controller |

### OLED protection
A full-screen black overlay fires every 5–10 minutes to prevent image burn-in on OLED panels.

---

## Quick Start

The minimum setup needs no API keys — just location and a password for the admin panel.

```bash
git clone https://github.com/TacoRebell/daylight-dashboard.git
cd daylight-dashboard
npm install
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:
```bash
ADMIN_PASSWORD=choose-a-password
```

Start the dev server:
```bash
npm run dev
```

Open **http://localhost:3000** for the dashboard and **http://localhost:3000/admin** to configure your location and stocks.

> Weather data comes from [Open-Meteo](https://open-meteo.com/) — free, no API key required. Stock data comes from Yahoo Finance — also no key required.

---

## Admin Panel

Visit `/admin` to configure the dashboard without touching any code or files.

| Setting | What it does |
|---|---|
| **Primary Location** | City search → sets weather, clock, and UV index |
| **Secondary Location** | Toggle on + search for a second city clock/weather card |
| **Connectivity Monitor** | Toggle on to show UniFi network stats |
| **Stock Ticker** | Add/remove ticker symbols |
| **Events Carousel** | Toggle on to show live music events via Ticketmaster |

Changes take effect immediately after saving — no restart required.

**Protecting the admin panel:** set `ADMIN_PASSWORD` in your environment. Without it the login page returns a 503 error.

---

## Full Setup

### Google Integration (Calendar, Tasks, Sheets)

Required for: goals, to-dos, events, celebrations, trip planner, and daily quotes.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Enable these APIs: **Google Calendar API**, **Google Tasks API**, **Google Sheets API**.
3. Create OAuth 2.0 credentials *(Web application type)*. Add `https://developers.google.com/oauthplayground` as an authorised redirect URI.
4. Open [OAuth Playground](https://developers.google.com/oauthplayground). Click the gear icon, check *Use your own OAuth credentials*, and enter your client ID and secret.
5. Authorise these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/tasks`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
6. Click *Exchange authorization code for tokens* and copy the **Refresh token**.
7. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   ```

**Calendar IDs** — go to each calendar's settings page → *Integrate calendar* → copy the Calendar ID:
```bash
GOOGLE_CALENDAR_ID_ANNIVERSARY=...   # anniversaries / celebrations
GOOGLE_CALENDAR_ID_TRIPS=...         # trips / travel
```

**Google Sheets** — create a spreadsheet and add the ID from its URL:
```bash
GOOGLE_SHEET_ID=...
```

Expected sheet structure:
- **Sheet1, cell A1** — quote or message of the day (optional)
- **Sheet named "Quotes"** — col A: quote text, col B: author (rows 2+)
- **Sheet named "Goals"** — col A: goal text (rows 2–10)

---

### Ticketmaster Events Carousel (optional)

Shows upcoming live music events for your area.

1. Register at [developer.ticketmaster.com](https://developer.ticketmaster.com/) — free tier available.
2. Add your key to `.env.local`:
   ```bash
   TICKETMASTER_API_KEY=...
   ```
3. Enable the carousel in `/admin` → Events Carousel.

---

### UniFi Connectivity Monitor (optional)

Shows live WAN latency, packet loss, and uptime from a Ubiquiti network controller.

1. In your UniFi controller go to **Settings → API** and create an API key.
2. Add to `.env.local`:
   ```bash
   UNIFI_API_KEY=...
   ```
3. Enable the widget in `/admin` → Internet Connectivity.

> Requires a UniFi Dream Machine or self-hosted controller with ISP Metrics enabled (Settings → System → ISP Metrics).

---

## Deployment

### Docker (recommended)

```bash
# Build
docker build -t daylight-dashboard .

# Run
docker run -d \
  --name daylight-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.local \
  -v $(pwd)/config.json:/app/config.json \
  daylight-dashboard
```

The `-v config.json` mount persists your admin settings across container restarts and rebuilds.

### Docker Compose

```bash
docker compose up -d
```

The included `docker-compose.yml` handles the volume mount and resource limits automatically.

### Raspberry Pi

See [deploy.md](deploy.md) for a complete guide covering Docker installation, auto-start, reverse proxy setup, and Raspberry Pi-specific performance tuning.

---

## Configuration Reference

All configuration lives in two places:
- **`.env.local`** — secrets and API keys (never committed)
- **`config.json`** — display preferences, edited via `/admin`

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | Yes | Password for the `/admin` settings panel |
| `GOOGLE_CLIENT_ID` | For Google features | OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | For Google features | OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | For Google features | Long-lived OAuth2 refresh token |
| `GOOGLE_SHEET_ID` | For goals & quotes | Spreadsheet ID from URL |
| `GOOGLE_CALENDAR_ID_ANNIVERSARY` | For celebrations | Calendar ID |
| `GOOGLE_CALENDAR_ID_TRIPS` | For trip planner | Calendar ID |
| `TICKETMASTER_API_KEY` | For events carousel | Ticketmaster Discovery API key |
| `UNIFI_API_KEY` | For connectivity widget | UniFi Network controller API key |

Copy `.env.example` to `.env.local` for a fully documented template.

---

## Architecture

```
layout.tsx  (revalidates 5 min)
  └── getStocks() → yahoo-finance2 → StockTicker

page.tsx  (force-dynamic, reads config.json)
  └── Promise.all([
        getFamilyGoals()     → Google Sheets
        getAnniversaries()   → Google Calendar
        getTrips()           → Google Calendar
        getUpcomingEvents()  → Google Calendar
        getQuotes()          → Google Sheets / ZenQuotes API
      ])

Client-side polling:
  WelcomeHeader       — weather every 15 min  (Open-Meteo)
  WeatherCard         — weather every 15 min  (Open-Meteo)
  SecondaryClockWeather — weather on mount    (Open-Meteo)
  TodoList            — tasks every 60 sec    (/api/tasks)
  ConnectivityWidget  — stats every 30 sec    (/api/connectivity)
```

**API routes:**
- `GET/POST /api/config` — read and write dashboard config; POST calls `revalidatePath('/')` to flush ISR cache
- `GET /api/tasks`, `POST /api/tasks/complete` — Google Tasks proxy
- `GET /api/connectivity` — UniFi ISP metrics proxy
- `GET /api/vegas-events` — Ticketmaster events (1h ISR cache)

---

## Development

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # ESLint
```

The project uses Next.js 16 App Router with TypeScript. Server components fetch data directly from `lib/`; client components receive it as props or poll their own API routes.

---

## License

MIT — see [LICENSE](LICENSE).
