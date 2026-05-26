"use client";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
}

export function CalendarList() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Defined inside useEffect to avoid dependency issues
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch calendar:", e);
      }
    }

    // 1. Use requestAnimationFrame to break the synchronous render cycle
    const animationFrame = requestAnimationFrame(() => {
      fetchEvents();
    });

    // 2. Set up polling (every 5 minutes)
    const interval = setInterval(fetchEvents, 300000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-2xl text-gray-500">
        <div>No events scheduled for the rest of the day.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <h3 className="text-white font-medium text-lg tracking-wide uppercase opacity-90 mb-2">
      </h3>
      <div className="space-y-6">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-center gap-6 text-xl">
            <span className="text-gray-400 w-24 text-right font-light text-lg">
              {evt.allDay ? "All Day" : format(parseISO(evt.start), "h:mm aa")}
            </span>
            <span className="text-2xl">📅</span>
            <span className="text-white font-medium">{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}