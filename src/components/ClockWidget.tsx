"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Helper function to update time
    const updateTime = () => setTime(new Date());

    // 1. Start the repeating interval
    const timer = setInterval(updateTime, 1000);

    // 2. Perform the initial update immediately (but async) to avoid the React warning
    // Using setTimeout(..., 0) pushes this to the next tick, preventing the "cascading render" error
    const initialSync = setTimeout(updateTime, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialSync);
    };
  }, []);

  // Prevent hydration mismatch by rendering nothing until client-side time is set
  if (!time) return null;

  return (
    <div className="flex flex-col justify-center text-white">
      {/* TIME & PM - Aligned on the baseline */}
      <div className="flex items-baseline">
        <span className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">
          {format(time, "HH:mm")}
        </span>
        
      </div>

      {/* DATE - Tucked in close below the time */}
      <span className="text-xl md:text-3xl font-light text-gray-400 tracking-wide mt-[-5px] md:mt-[-10px]">
        {format(time, "EEEE, MMMM d")}
      </span>
    </div>
  );
}