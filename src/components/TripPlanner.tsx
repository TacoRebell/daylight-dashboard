"use client";

import { Plane, MapPin, Calendar, Compass } from 'lucide-react';
import { motion } from 'motion/react';
// FIX: Added differenceInCalendarDays to imports
import { format, parseISO, isSameMonth, isSameYear, differenceInCalendarDays } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date string
  end?: string;  // Calendar events usually have an end date
  location?: string;
  allDay: boolean;
}

interface TripPlannerProps {
  items: CalendarEvent[];
}

// Visual themes
const TRIP_STYLES = [
  { 
    color: 'from-blue-500/20 to-blue-600/10',
    accent: 'text-blue-400',
    icon: Plane
  },
  { 
    color: 'from-cyan-500/20 to-cyan-600/10',
    accent: 'text-cyan-400',
    icon: Compass
  },
  { 
    color: 'from-indigo-500/20 to-indigo-600/10',
    accent: 'text-indigo-400',
    icon: MapPin
  },
];

export function TripPlanner({ items = [] }: TripPlannerProps) {
  const today = new Date();
  
  // Format the date range (e.g., "Jul 15 - 22" or "Jul 28 - Aug 4")
  const formatDateRange = (startStr: string, endStr?: string) => {
    const start = parseISO(startStr);
    if (!endStr) return format(start, 'MMM d, yyyy');

    const end = parseISO(endStr);
    
    if (isSameMonth(start, end) && isSameYear(start, end)) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center gap-2 mb-5">
        <Plane className="size-5 text-blue-400" />
        <h2 className="text-xl text-white">Trip Planner</h2>
      </div>
      
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((trip, index) => {
            const style = TRIP_STYLES[index % TRIP_STYLES.length];
            const Icon = style.icon;
            
            // Calculate Days Left
            const startDate = parseISO(trip.start);
            const daysLeft = Math.max(0, differenceInCalendarDays(startDate, today));
            const isToday = daysLeft === 0;

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`bg-gradient-to-br ${style.color} rounded-xl p-4 border border-white/5`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon Column */}
                  <div className={`p-2 rounded-lg bg-white/10`}>
                    <Icon className={`size-5 ${style.accent}`} />
                  </div>
                  
                  {/* Info Column */}
                  <div className="flex-1 min-w-0"> {/* min-w-0 handles truncation properly */}
                    <div className="text-white mb-1 font-medium truncate">{trip.title}</div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Calendar className="size-3.5" />
                        {formatDateRange(trip.start, trip.end)}
                      </div>
                    </div>
                    
                    {/* Location Badge (Optional) */}
                    {trip.location && (
                      <div className="mt-2 flex gap-2">
                         <div className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-2 py-1 rounded-md">
                          <MapPin className="size-3" />
                          <span className="truncate max-w-[120px]">{trip.location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Countdown Column */}
                  <div className="text-right pl-2 border-l border-white/10 ml-1">
                     {isToday ? (
                        <div className={`${style.accent} font-bold text-sm whitespace-nowrap`}>Today!</div>
                     ) : (
                       <>
                        <div className={`text-2xl ${style.accent} font-bold leading-none`}>
                          {daysLeft}
                        </div>
                        <div className="text-white/50 text-xs mt-1">days</div>
                       </>
                     )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-white/30 text-center py-6 italic">
            No upcoming trips found.
          </div>
        )}
      </div>
    </motion.div>
  );
}