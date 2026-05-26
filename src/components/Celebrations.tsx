"use client";

import { Calendar, Cake, PartyPopper, Heart, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date string
  allDay: boolean;
}

interface CelebrationsProps {
  items: CalendarEvent[];
}

// Helper to assign icons/colors based on keywords in the event title
const getEventStyle = (title: string, index: number) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('birthday') || lowerTitle.includes('bday')) {
    return { icon: Cake, color: 'from-pink-500/20 to-pink-600/10', accent: 'text-pink-400' };
  }
  if (lowerTitle.includes('anniversary')) {
    return { icon: Heart, color: 'from-red-500/20 to-red-600/10', accent: 'text-red-400' };
  }
  if (lowerTitle.includes('party') || lowerTitle.includes('reunion')) {
    return { icon: PartyPopper, color: 'from-purple-500/20 to-purple-600/10', accent: 'text-purple-400' };
  }
  
  // Default cycling styles for generic events
  const defaults = [
    { icon: Gift, color: 'from-blue-500/20 to-blue-600/10', accent: 'text-blue-400' },
    { icon: Calendar, color: 'from-green-500/20 to-green-600/10', accent: 'text-green-400' },
  ];
  return defaults[index % defaults.length];
};

export function Celebrations({ items = [] }: CelebrationsProps) {
  const today = new Date();

  // Process and sort events by nearest date
  const events = items
    .map((event, index) => {
      const startDate = parseISO(event.start);
      const daysLeft = differenceInCalendarDays(startDate, today);
      const style = getEventStyle(event.title, index);
      
      return {
        ...event,
        dateFormatted: format(startDate, 'MMM d'),
        daysLeft: Math.max(0, daysLeft), // Prevent negative numbers
        ...style
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3); // Limit to top 3

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center gap-2 mb-5">
        <PartyPopper className="size-5 text-pink-400" />
        <h2 className="text-xl text-white">Celebrations</h2>
      </div>
      
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((celebration, index) => (
            <motion.div
              key={celebration.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.1 }}
              className={`bg-gradient-to-br ${celebration.color} rounded-xl p-4 border border-white/5 relative overflow-hidden`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Circular Progress: Visual countdown only activates in the last 30 days */}
                  <svg className="size-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className={celebration.accent}
                      // Logic: If >30 days away, stroke is 0 (empty). If 0 days away, stroke is 150 (full).
                      strokeDasharray={`${Math.max(0, (30 - celebration.daysLeft) * 5)} 150`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <celebration.icon className={`size-5 ${celebration.accent}`} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-white mb-0.5 font-medium truncate">{celebration.title}</div>
                  <div className="text-white/50 text-sm">{celebration.dateFormatted}</div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl ${celebration.accent} font-bold`}>{celebration.daysLeft}</div>
                  <div className="text-white/50 text-xs">days left</div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
           // FIX: Updated text to be generic since we might show events far in the future
           <div className="text-white/30 text-center py-8 italic">
             No upcoming celebrations found.
           </div>
        )}
      </div>
    </motion.div>
  );
}