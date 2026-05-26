"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ScreenWipe() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ top: 50, left: 50 });
  
  // FIX 1: Initialize empty. We don't need the time until the saver activates.
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    // FIX 2: Removed the synchronous setTimeStr() call that was here.
    
    let timeoutId: NodeJS.Timeout;

    const scheduleNextWipe = () => {
      // Random wait: 5 to 10 minutes
      const waitTime = Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;
      
      timeoutId = setTimeout(() => {
        triggerWipe();
      }, waitTime);
    };

    const triggerWipe = () => {
      // Update time string strictly inside this asynchronous function
      // This happens minutes after mount, so it won't cause a render error.
      setTimeStr(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));

      const randomTop = Math.floor(Math.random() * 60) + 20; 
      const randomLeft = Math.floor(Math.random() * 60) + 20;
      setPosition({ top: randomTop, left: randomLeft });

      setIsActive(true);

      // Show for 5-10 seconds
      const duration = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

      setTimeout(() => {
        setIsActive(false);
        scheduleNextWipe(); 
      }, duration);
    };

    scheduleNextWipe();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] bg-black cursor-none"
        >
          <div 
            className="absolute text-white/50 font-bold text-8xl tracking-tight whitespace-nowrap"
            style={{ 
              top: `${position.top}%`, 
              left: `${position.left}%`,
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {timeStr}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}