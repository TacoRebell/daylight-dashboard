# ☀️ Daylight Dashboard

## 1. High-Level Overview

**Daylight Dashboard** is a personal/family information hub designed to run on a dedicated tablet or wall-mounted display. It serves as a "Control Tower" for your daily life, aggregating data from multiple sources into a high-contrast, glanceable interface.

**Core Philosophy:**

- **"Glanceability":** Large typography and high contrast for readability from a distance.
- **Aggregated Intelligence:** Combines finance, schedule, tasks, and motivation in one view.
- **Privacy-First:** Connects directly to your personal Google & Yahoo accounts without third-party data storage.

## 2. Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Sources:**
- **Google Sheets:** Family goals and custom lists.
- **Google Calendar:** Daily agenda, anniversaries, and trip countdowns.
- **Yahoo Finance:** Real-time stock and mutual fund tracking (via `yahoo-finance2`).
- **ZenQuotes:** Daily inspirational quotes.
- **OpenWeather** (Client-side fetching via `WeatherWidget`).

## 3. Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       └── route.ts       # Main backend aggregator (Server-Side)
│   ├── page.tsx               # Main Dashboard UI (Client-Side)
│   └── globals.css            # Tailwind & global styles
├── components/
│   ├── ClockWidget.tsx        # Large digital clock with date
│   ├── WeatherWidget.tsx      # Current weather & forecast
│   ├── StockTicker.tsx        # Finance/Market watch cards
│   ├── GoalsWidget.tsx        # Displays family goals from Sheets
│   ├── CountdownWidget.tsx    # Days until specific events
│   ├── MessageWidget.tsx      # Daily quote display
│   ├── TaskList.tsx           # Todo list
│   └── ... (Other widgets)
└── lib/                       # Utility functions (if applicable)

```

## 4. Architecture & Data Flow

The app uses a **Hybrid Data Approach**:

1. **Central Aggregator (`/api/dashboard`):**

- Most data (Calendar, Stocks, Goals, Quotes) is fetched server-side in a single batch request.
- **Why?** This hides API keys (Google, Yahoo) from the client browser and allows for efficient caching.
- **Caching:** The API implements a 5-minute in-memory cache to prevent hitting API rate limits.

2. **Client-Side Hydration:**

- The main page (`page.tsx`) polls this API endpoint every **5-10 minutes**.
- Autonomous widgets (like `ClockWidget`) maintain their own internal state (e.g., ticking every second) independent of the data fetch.

## 5. Setup & Installation

### Prerequisites

- Node.js 18+
- A Google Cloud Project with **Sheets** and **Calendar** APIs enabled.

### 1. Install Dependencies

```bash
npm install

```

### 2. Environment Variables

Create a `.env.local` file in the root directory. You will need the following keys:

```bash
# Google Authentication (OAuth2)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Data Source IDs
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_CALENDAR_ID_ANNIVERSARY=calendar_id_for_anniversaries
GOOGLE_CALENDAR_ID_TRIPS=calendar_id_for_trips

```

### 3. Run Locally

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the dashboard.

## 6. Key Components Breakdown

### Backend: `src/app/api/dashboard/route.ts`

This is the brain of the operation. It performs the following steps:

1. **Check Cache:** Returns data immediately if the last fetch was < 5 mins ago.
2. **Auth:** Authenticates with Google using the Refresh Token strategy.
3. **Parallel Fetch:** Uses `Promise.all` to fetch Sheets, Calendar, and Stocks simultaneously to minimize latency.
4. **Yahoo Finance:** Uses the `yahoo-finance2` library (instantiated via constructor) to fetch detailed quote summaries, specifically robust enough for Mutual Funds (e.g., SWPPX).

### Frontend: `src/app/page.tsx`

The main layout controller.

- **Layout:** Uses Flexbox for the header (alignment of Clock/Weather) and CSS Grid for the widget rows.
- **Auto-Refresh:** Uses `useEffect` with `setInterval` to keep data fresh without manual reloading.

### 7. Common Development Tasks

#### **How to Add a New Stock Ticker**

1. Open `src/app/api/dashboard/route.ts`.
2. Locate the `tickers` array inside the `getStocks` function.
3. Add the symbol (e.g., `"TSLA"`).

```typescript
const tickers = ["AMZN", "QBTS", "INTC", "TSLA"];
```

4. The frontend will automatically render a new card for it.

#### **How to Add a New Widget**

1. Create a new file in `src/components/` (e.g., `NewWidget.tsx`).
2. Import it in `src/app/page.tsx`.
3. Place it in the desired Grid or Flex container.

#### **How to Change Styling (Colors, Fonts, Spacing)**

The app uses **Tailwind CSS**, so most styling happens directly in the component files (`.tsx`).

- **Global Theme:** Open `src/app/globals.css` to change the default background color or font smoothing.

```css
body {
  background: #050505; /* Change main background here */
  color: white;
}
```

- **Component Styling:** To change the look of a specific widget, edit its file directly.
- _Example:_ To make the Clock text red instead of white, open `ClockWidget.tsx` and change `text-white` to `text-red-500`.

- **Font Sizes:** We use standard Tailwind sizes.
- `text-xs`, `text-sm`: Metadata/labels.
- `text-xl`, `text-2xl`: Standard widget data.
- `text-7xl`, `text-9xl`: Hero elements (Clock).

#### **How to Change the Polling Interval**

- **Frontend:** In `src/app/page.tsx`, change the `600000` (10 mins) value in the `setInterval` call.
- **Backend Cache:** In `src/app/api/dashboard/route.ts`, change `CACHE_DURATION` (default 5 mins).

## 8. Known Limitations & Tech Debt

- **Google Auth Token Expiry:** If the `GOOGLE_REFRESH_TOKEN` becomes invalid (e.g., password change), the dashboard will fail to load Google data. You must generate a new token manually.
- **Serverless Caching:** If deployed on Vercel/Serverless, the "in-memory cache" in the API route resets whenever the lambda function spins down. This is usually fine but may result in slightly more API calls than a persistent server.
- **Weather Widget:** Currently, the Weather widget likely fetches data client-side (based on typical patterns). If you want to hide its API key, logic should eventually be moved to the server-side API aggregator.
