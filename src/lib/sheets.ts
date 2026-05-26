import { google } from "googleapis";

// Define the structure for ZenQuotes API response
interface ZenQuote {
  q: string; // Quote text
  a: string; // Author
  h?: string; // HTML format (optional)
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const sheets = google.sheets({ version: "v4", auth: oauth2Client });

// Generic Fetcher
export async function getSheetData(spreadsheetId: string, range: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

// --- HELPER: ZenQuotes Integration ---
async function fetchZenQuotes() {
  try {
    // revalidate: 3600 caches it for 1 hour to respect API rate limits
    const res = await fetch('https://zenquotes.io/api/quotes', { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error("ZenQuotes API failed");
    
    const data: ZenQuote[] = await res.json(); // <--- Typed correctly now
    
    return data.map((item) => ({
      text: item.q,
      author: item.a
    })).slice(0, 5);
  } catch (error) {
    console.warn("ZenQuotes fetch error:", error);
    return [];
  }
}

// 1. Family Goals Fetcher
export async function getFamilyGoals() {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; 
  const RANGE = "Goals!A2:A10"; 

  if (!SPREADSHEET_ID) return [];

  const rows = await getSheetData(SPREADSHEET_ID, RANGE);
  return rows.flat().filter((cell) => cell && cell.trim().length > 0);
}

// 2. Quotes Fetcher (Sheet -> ZenQuotes -> Fallback)
export async function getQuotes() {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
  const RANGE = "Quotes!A2:B20"; // Col A = Quote, Col B = Author

  const defaults = [
    { text: "Family is not an important thing. It's everything.", author: "Michael J. Fox" },
    { text: "The love of family is life's greatest blessing.", author: "Unknown" },
    { text: "In family life, love is the oil that eases friction.", author: "Friedrich Nietzsche" },
    { text: "Family means no one gets left behind.", author: "David Ogden Stiers" },
  ];

  // 1. Try Google Sheets
  if (SPREADSHEET_ID) {
    try {
      const rows = await getSheetData(SPREADSHEET_ID, RANGE);
      if (rows && rows.length > 0) {
        return rows.map(row => ({
          text: row[0] || "Enjoy the little things.",
          author: row[1] || "Unknown"
        }));
      }
    } catch (error) {
      console.warn("Google Sheet fetch failed, falling back to ZenQuotes.");
    }
  }

  // 2. Try ZenQuotes (If Sheet is missing, empty, or fails)
  const zenQuotes = await fetchZenQuotes();
  if (zenQuotes.length > 0) {
    return zenQuotes;
  }

  // 3. Fallback to Hardcoded Defaults
  return defaults;
}