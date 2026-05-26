"use client";
import { CalendarHeart, Plane } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface EventItem {
  title: string;
  date: string;
}

interface CountdownProps {
  type: "anniversary" | "trip";
  events: EventItem[];
}

export function CountdownWidget({ type, events }: CountdownProps) {
  const isTrip = type === "trip";
  const Icon = isTrip ? Plane : CalendarHeart;
  const colorClass = isTrip ? "text-blue-400" : "text-pink-400";
  const title = isTrip ? "Upcoming Trips" : "Celebrations";

  const safeEvents = events || [];

  return (
    <div className="flex flex-col p-6 bg-surface rounded-3xl border border-white/10 w-full h-48 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <h3 className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>{title}</h3>
      </div>
      
      {/* Content List */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {safeEvents.length > 0 ? (
          safeEvents.map((event, i) => {
            const daysLeft = differenceInDays(new Date(event.date), new Date());
            const isToday = daysLeft === 0;
            
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex flex-col min-w-0 pr-4">
                   {/* UPDATED: text-base matches GoalsWidget */}
                   <span className="text-base font-medium text-white truncate leading-tight">{event.title}</span>
                   <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                     {format(new Date(event.date), "MMM d")}
                   </span>
                </div>

                <div className="flex-shrink-0 text-right">
                   {isToday ? (
                     <span className="text-xs font-bold text-green-400 animate-pulse">TODAY</span>
                   ) : (
                     <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white tracking-tight">{daysLeft}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Days</span>
                     </div>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
             <span className="text-xs font-medium uppercase tracking-widest">No plans yet</span>
          </div>
        )}
      </div>
    </div>
  );
}