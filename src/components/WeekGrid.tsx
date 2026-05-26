"use client";
import { useEffect, useState } from "react";
import { format, parseISO, isSameDay, addDays } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
}

export function WeekGrid() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const next5Days = Array.from({ length: 5 }).map((_, i) => addDays(today, i));
    setDays(next5Days);
    
    async function fetchWeek() {
      try {
        const res = await fetch("/api/calendar/week");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchWeek();
  }, []);

  return (
    // Height increased to 400px to accommodate larger text comfortably
    <div className="grid grid-cols-5 gap-4 w-full h-[400px]">
      {days.map((day) => {
        const dayEvents = events.filter((e) => 
          isSameDay(parseISO(e.start), day)
        );

        return (
          <div key={day.toISOString()} className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col h-full overflow-hidden">
            
            {/* Header: Large and Readable */}
            <div className="mb-4 pb-2 border-b border-white/10 flex justify-between items-baseline">
              <span className="text-red-400 font-bold uppercase text-sm tracking-widest">
                {format(day, "EEE")}
              </span>
              <span className="text-2xl text-white font-medium">
                {format(day, "d")}
              </span>
            </div>

            {/* Events: Matched to "Today" readability */}
            <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
              {dayEvents.length === 0 ? (
                <div className="text-gray-600 text-lg font-medium mt-2">Free</div>
              ) : (
                dayEvents.map((evt) => (
                  <div key={evt.id} className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium uppercase mb-0.5">
                      {evt.allDay ? "All Day" : format(parseISO(evt.start), "h:mm aa")}
                    </span>
                    <span className="text-white text-lg font-medium leading-tight truncate">
                      {evt.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}