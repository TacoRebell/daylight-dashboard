"use client";

import { Target, Plane, GraduationCap, Star, Trophy, Heart } from 'lucide-react';
import { motion } from 'motion/react';
// We don't import Progress yet because we don't have percentage data, 
// but we keep the visual structure ready for it.

interface FamilyGoalsProps {
  items: string[];
}

// We define the styles separately from the data
const CARD_STYLES = [
  { id: 1, icon: Plane, color: 'from-green-500/20 to-green-600/10', accent: 'text-green-400' },
  { id: 2, icon: Target, color: 'from-orange-500/20 to-orange-600/10', accent: 'text-orange-400' },
  { id: 3, icon: GraduationCap, color: 'from-purple-500/20 to-purple-600/10', accent: 'text-purple-400' },
  { id: 4, icon: Star, color: 'from-blue-500/20 to-blue-600/10', accent: 'text-blue-400' },
  { id: 5, icon: Trophy, color: 'from-yellow-500/20 to-yellow-600/10', accent: 'text-yellow-400' },
  { id: 6, icon: Heart, color: 'from-pink-500/20 to-pink-600/10', accent: 'text-pink-400' },
];

export function FamilyGoals({ items = [] }: FamilyGoalsProps) {
  const safeItems = items || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center gap-2 mb-5">
        <Target className="size-5 text-green-400" />
        <h2 className="text-xl text-white">Family Goals</h2>
      </div>
      
      <div className="space-y-4">
        {safeItems.length > 0 ? (
          safeItems.map((goalText, index) => {
            // Cycle through the predefined styles
            const style = CARD_STYLES[index % CARD_STYLES.length];
            const Icon = style.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-gradient-to-br ${style.color} rounded-xl p-4 border border-white/5 flex items-center gap-4`}
              >
                <div className={`p-2 rounded-lg bg-white/5 ${style.accent}`}>
                   <Icon className="size-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-medium text-lg leading-tight">{goalText}</div>
                  {/* Placeholder for when we have real dates/progress */}
                  <div className="text-white/40 text-xs mt-1">In Progress</div>
                </div>
              </motion.div>
            );
          })
        ) : (
           <div className="text-white/30 text-center py-4 italic">
             No active goals set in Sheets.
           </div>
        )}
      </div>
    </motion.div>
  );
}