import { NextResponse } from "next/server";
import { google } from "googleapis";
import YahooFinance from "yahoo-finance2";

// 1. DATA TYPES
interface YahooQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePct: string;
}

interface EventData {
  title: string;
  date: string;
}

interface DashboardData {
  message: string;
  author: string;
  goals: string[];
  stocks: StockData[];
  anniversary: EventData[];
  trip: EventData[];
}

// 2. SERVER-SIDE CACHE
const cache: { data: DashboardData | null; lastFetch: number } = {
  data: null,
  lastFetch: 0
};

const CACHE_DURATION = 300000; // 5 Minutes

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = Date.now();

  // 3. CHECK CACHE
  if (cache.data && (now - cache.lastFetch < CACHE_DURATION)) {
    return NextResponse.json(cache.data);
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const sheets = google.sheets({ version: "v4", auth });
    const calendar = google.calendar({ version: "v3", auth });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const annivCalId = process.env.GOOGLE_CALENDAR_ID_ANNIVERSARY; 
    const tripCalId = process.env.GOOGLE_CALENDAR_ID_TRIPS;

    // --- HELPER: Fetch Calendar ---
    const getNextEvents = async (calendarId: string | undefined): Promise<EventData[]> => {
      if (!calendarId) return [];
      try {
        const res = await calendar.events.list({
          calendarId,
          timeMin: new Date().toISOString(),
          maxResults: 3,
          singleEvents: true,
          orderBy: "startTime",
        });
        
        return (res.data.items || []).map((event) => ({
          title: event.summary || "Event",
          date: event.start?.date || event.start?.dateTime || new Date().toISOString()
        }));
      } catch (e) {
        console.error(`Cal fetch error for ${calendarId}`, e);
        return [];
      }
    };

    // --- HELPER: Fetch Stocks via Yahoo Library ---
    const getStocks = async (): Promise<StockData[]> => {
      const tickers = ['AMZN', 'QBTS', 'INTC', 'SMH', 'SWPPX', 'SWTSX'];
      const results: StockData[] = [];
      
      // Instantiate Yahoo Finance v3
      const yahooFinance = new YahooFinance();
      
      for (const ticker of tickers) {
        try {
          const result = await yahooFinance.quoteSummary(ticker, { modules: ['price'] });
          const priceData = result?.price;
          
          if (priceData) {
            results.push({
              symbol: ticker,
              price: (priceData.regularMarketPrice ?? 0).toString(),
              change: (priceData.regularMarketChange ?? 0).toFixed(2),
              changePct: (priceData.regularMarketChangePercent ?? 0).toFixed(2)
            });
          }
        } catch (e) {
          console.error(`Error fetching ${ticker}:`, e);
          // Continue with other tickers even if one fails
        }
      }
      
      return results;
    };

    // --- PARALLEL FETCH ---
    const [msgRes, goalsRes, stockData, annivEvents, tripEvents] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A1" }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet2!A1:A10" }),
      getStocks(), 
      getNextEvents(annivCalId),
      getNextEvents(tripCalId)
    ]);

    // --- PROCESS GOOGLE DATA ---
    let message = msgRes.data.values?.[0]?.[0] || "";
    let author = "Family";
    const goals: string[] = (goalsRes.data.values?.flat() || []).map(String);

    if (!message) {
      try {
        const quoteRes = await fetch("https://zenquotes.io/api/today");
        const quoteData = await quoteRes.json();
        message = quoteData[0]?.q || "Make today amazing.";
        author = quoteData[0]?.a || "System";
      } catch (e) {
        message = "Make today amazing.";
        author = "System";
      }
    }

    const finalData: DashboardData = { 
        message, 
        author, 
        goals,
        stocks: stockData,
        anniversary: annivEvents, 
        trip: tripEvents          
    };

    cache.data = finalData;
    cache.lastFetch = now;

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Dashboard API Error:", error);
    if (cache.data) return NextResponse.json(cache.data);
    
    const emptyData: DashboardData = { 
        message: "Error loading data", 
        author: "System", 
        goals: [], 
        stocks: [], 
        anniversary: [], 
        trip: [] 
    };
    return NextResponse.json(emptyData);
  }
}