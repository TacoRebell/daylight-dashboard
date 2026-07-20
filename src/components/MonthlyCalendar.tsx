"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  format,
} from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  allDay: boolean;
}

interface MonthlyCalendarProps {
  events: CalendarEvent[];
  celebrations: CalendarEvent[];
  trips: CalendarEvent[];
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MonthlyCalendar({ events = [], celebrations = [], trips = [] }: MonthlyCalendarProps) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    // `new Date()` isn't safe to read during SSR/hydration — gate it behind
    // mount, same convention as SecondaryClockWeather/TertiaryWeather.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
  }, []);

  if (!today) return <div className="h-[380px]" />;

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const parsedEvents = events.map((e) => ({ ...e, date: parseISO(e.start) }));
  const parsedCelebrations = celebrations.map((e) => ({ ...e, date: parseISO(e.start) }));
  const parsedTrips = trips.map((e) => ({ ...e, date: parseISO(e.start) }));

  const dayHasCategory = (list: { date: Date }[], day: Date) =>
    list.some((item) => isSameDay(item.date, day));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="size-5 text-blue-400" />
        <h2 className="text-xl text-white">{format(today, 'MMMM yyyy')}</h2>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-white/40 text-xs uppercase py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, today);
          const dayIsToday = isToday(day);
          const hasEvent = dayHasCategory(parsedEvents, day);
          const hasTrip = dayHasCategory(parsedTrips, day);
          const hasCelebration = dayHasCategory(parsedCelebrations, day);
          const hasAny = hasEvent || hasTrip || hasCelebration;

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 gap-0.5 ${
                dayIsToday ? 'bg-blue-500/20 ring-1 ring-blue-400/50' : hasAny ? 'bg-white/5' : ''
              }`}
            >
              <span
                className={`text-sm ${
                  !inMonth ? 'text-white/20' : dayIsToday ? 'text-blue-300 font-semibold' : 'text-white/80'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex items-center gap-0.5 h-1.5">
                {hasEvent && <span className="size-1 rounded-full bg-blue-400" />}
                {hasTrip && <span className="size-1 rounded-full bg-cyan-400" />}
                {hasCelebration && <span className="size-1 rounded-full bg-pink-400" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <span className="size-1.5 rounded-full bg-blue-400" />
          Upcoming Events
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <span className="size-1.5 rounded-full bg-cyan-400" />
          Trips
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <span className="size-1.5 rounded-full bg-pink-400" />
          Celebrations
        </div>
      </div>
    </motion.div>
  );
}
