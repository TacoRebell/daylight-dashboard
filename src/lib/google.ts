import { google } from "googleapis";
import { formatInTimeZone } from "date-fns-tz";
import { readConfig } from "./config";

// OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const tasks = google.tasks({ version: "v1", auth: oauth2Client });

// Reads config.json fresh each call so it follows whatever primaryLocation
// is currently configured via /admin, rather than being fixed at process start.
function getTimeZone(): string {
  return readConfig().primaryLocation.timezone || "America/New_York";
}

// --- SHARED HELPER ---
async function fetchEvents(timeMin: string, timeMax: string, calendarId: string = process.env.CALENDAR_ID || 'primary') {
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      timeZone: getTimeZone(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = response.data.items || [];
    
    // Validate and map events to ensure strict types
    return items
      .filter(event => event.id && (event.start?.dateTime || event.start?.date))
      .map((event) => {
        const start = event.start?.dateTime || event.start?.date || "";
        const allDay = !event.start?.dateTime;
        
        return {
          id: event.id || "",
          title: event.summary || "Busy",
          start: start,
          allDay: allDay,
          location: event.location || "",
        };
      });
  } catch (error) {
    console.error(`Error fetching calendar (${calendarId}):`, error);
    return [];
  }
}

// --- EXPORTED FUNCTIONS ---

// 1. Upcoming Events (Primary Calendar) - Next N events regardless of date
export async function getUpcomingEvents(limit: number = 4) {
  const timeZone = getTimeZone();
  const now = new Date();
  const timeMin = formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'00:00:00XXX");

  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  const timeMax = formatInTimeZone(nextYear, timeZone, "yyyy-MM-dd'T'23:59:59XXX");

  const events = await fetchEvents(timeMin, timeMax);
  return events.slice(0, limit);
}

// 2. Anniversaries - Next 30 Days
export async function getAnniversaries() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID_ANNIVERSARY;
  if (!calendarId) return [];

  const timeZone = getTimeZone();
  const now = new Date();
  const timeMin = formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'00:00:00XXX");

  const nextMonth = new Date(now);
  nextMonth.setDate(now.getDate() + 90);
  const timeMax = formatInTimeZone(nextMonth, timeZone, "yyyy-MM-dd'T'23:59:59XXX");

  return fetchEvents(timeMin, timeMax, calendarId);
}

// 3. Trips - Next 90 Days
export async function getTrips() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID_TRIPS;
  if (!calendarId) return [];

  const timeZone = getTimeZone();
  const now = new Date();
  const timeMin = formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'00:00:00XXX");

  const nextQuarter = new Date(now);
  nextQuarter.setDate(now.getDate() + 90);
  const timeMax = formatInTimeZone(nextQuarter, timeZone, "yyyy-MM-dd'T'23:59:59XXX");

  return fetchEvents(timeMin, timeMax, calendarId);
}

// --- TASKS FUNCTIONS (Preserved) ---

export async function getFamilyTasks() {
  try {
    const taskLists = await tasks.tasklists.list();
    const firstListId = taskLists.data.items?.[0]?.id;

    if (!firstListId) return [];

    const response = await tasks.tasks.list({
      tasklist: firstListId,
      showCompleted: false,
      maxResults: 20, // Increased limit
    });

    return response.data.items?.map((task) => {
      return {
        id: task.id || "",
        listId: firstListId,
        title: task.title || "Untitled Task",
        status: task.status || "needsAction",
        due: task.due ? task.due : null,
      };
    }) || [];
    
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function completeTask(listId: string, taskId: string) {
  try {
    await tasks.tasks.patch({
      tasklist: listId,
      task: taskId,
      requestBody: {
        status: 'completed',
      },
    });
    return true;
  } catch (error) {
    console.error("Error completing task:", error);
    return false;
  }
}