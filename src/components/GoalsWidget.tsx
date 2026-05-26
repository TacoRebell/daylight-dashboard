"use client";
import { Target } from "lucide-react";

interface GoalsProps {
  items: string[];
}

export function GoalsWidget({ items }: GoalsProps) {
  const safeItems = items || [];

  return (
    <div className="flex flex-col p-6 bg-surface rounded-3xl border border-white/10 w-full h-48 shadow-xl backdrop-blur-md justify-start">
      {/* HEADER: Synced with CountdownWidget (w-5, text-xs) */}
      <div className="flex items-center gap-3 mb-2">
        <Target className="w-5 h-5 text-green-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-green-400">Family Goals</h3>
      </div>
      
      {/* CONTENT: Synced with CountdownWidget (text-base) */}
      <div className="space-y-3 overflow-hidden mt-1">
        {safeItems.length > 0 ? (
          safeItems.map((goal, i) => (
            <div key={i} className="flex items-start gap-3">
              {/* Bullet adjusted to align with text baseline */}
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 flex-shrink-0 mt-2" />
              <span className="text-base font-medium text-white leading-tight">{goal}</span>
            </div>
          ))
        ) : (
          <span className="text-gray-600 text-sm italic">No active goals set.</span>
        )}
      </div>
    </div>
  );
}