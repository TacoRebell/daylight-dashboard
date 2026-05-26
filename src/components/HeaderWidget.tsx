"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export function HeaderWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());

    // 1. Start the repeating interval
    const timer = setInterval(updateTime, 1000);

    // 2. Perform the initial update immediately (but async) to avoid the React warning
    const initialSync = setTimeout(updateTime, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialSync);
    };
  }, []);

  if (!time) return <div className="h-32 animate-pulse" />;

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4">
      {/* TIME */}
      <h1 className="text-7xl md:text-8xl font-medium tracking-tight text-white drop-shadow-lg">
        {format(time, "h:mm")}
        <span className="text-2xl md:text-3xl ml-3 text-white/40 font-normal">
          {format(time, "a")}
        </span>
      </h1>

      {/* GREETING */}
      <div className="mt-2 text-xl md:text-2xl text-white/80 font-medium flex items-center gap-2">
        Good evening! <span className="animate-wave origin-[70%_70%]">👋</span>
      </div>

      {/* DATE */}
      <div className="mt-1 text-sm md:text-base text-white/40 font-medium uppercase tracking-widest">
        {format(time, "EEEE, MMMM d, yyyy")}
      </div>
    </div>
  );
}