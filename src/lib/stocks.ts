import YahooFinance from 'yahoo-finance2';
import { readConfig } from './config';

// 1. Frontend Data Shape
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// 2. Raw API Response Shape
interface RawYahooQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

export async function getStocks() {
  const tickers = readConfig().stocks.symbols;
  const results: StockData[] = [];

  try {
    // FIX: Instantiate the class from the default export
    const yahooFinance = new YahooFinance();

    // Fetch and cast
    const quotes = await yahooFinance.quote(tickers) as unknown as RawYahooQuote[];

    // Safety check
    const safeQuotes = Array.isArray(quotes) ? quotes : [quotes];

    safeQuotes.forEach((quote) => {
      if (quote && quote.symbol) {
        results.push({
          symbol: quote.symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    return [];
  }
}