"use client";

import { Calendar as CalendarIcon, Users, Utensils, Stethoscope, Briefcase, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from './ui/avatar';
import { format, isToday, parseISO } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  allDay: boolean;
  location?: string;
}

interface UpcomingEventsProps {
  items: CalendarEvent[];
}

const getEventMeta = (title: string, index: number) => {
  const lower = title.toLowerCase();
  
  if (lower.includes('dinner') || lower.includes('lunch')) {
    return { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500', member: 'Fam' };
  }
  if (lower.includes('doctor') || lower.includes('dr.') || lower.includes('dentist')) {
    return { icon: Stethoscope, color: 'text-pink-400', bg: 'bg-pink-500', member: 'Mom' };
  }
  if (lower.includes('soccer') || lower.includes('gym') || lower.includes('practice')) {
    return { icon: Users, color: 'text-green-400', bg: 'bg-green-500', member: 'Kid' };
  }
  if (lower.includes('meeting') || lower.includes('work')) {
    return { icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500', member: 'Dad' };
  }

  const defaults = [
    { icon: CalendarIcon, color: 'text-blue-400', bg: 'bg-blue-500', member: 'All' },
    { icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500', member: 'Us' },
  ];
  return defaults[index % defaults.length];
};

export function UpcomingEvents({ items = [] }: UpcomingEventsProps) {
  const displayEvents = items.slice(0, 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex flex-col"
    >
      {/* Simplified Header */}
      <div className="flex items-center gap-2 mb-5">
        <CalendarIcon className="size-5 text-blue-400" />
        <h2 className="text-xl text-white">Upcoming Events</h2>
      </div>
      
      <div className="space-y-3">
        {displayEvents.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {displayEvents.map((event, index) => {
              const meta = getEventMeta(event.title, index);
              const dateObj = parseISO(event.start);
              const dateLabel = isToday(dateObj) ? 'Today' : format(dateObj, 'MMM d');
              const timeLabel = event.allDay ? 'All Day' : format(dateObj, 'h:mm a');

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${meta.color} flex-shrink-0`}>
                      <meta.icon className="size-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white mb-0.5 font-medium truncate">{event.title}</div>
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <span className={isToday(dateObj) ? "text-blue-400 font-medium" : ""}>
                          {dateLabel}
                        </span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {timeLabel}
                        </div>
                      </div>
                    </div>
                    
                    <Avatar className="size-8 flex-shrink-0 border border-white/10">
                      <AvatarFallback className={`${meta.bg} text-white text-[10px]`}>
                        {meta.member}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-white/30 text-center py-6 italic">
            No upcoming events found.
          </div>
        )}
      </div>
    </motion.div>
  );
}