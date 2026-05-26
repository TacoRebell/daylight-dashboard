"use client";
import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

export function NightModeOverlay() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    function checkTime() {
      const hour = new Date().getHours();
      // Night Mode Active: From 10 PM (22) to 6 AM (6)
      const night = hour >= 22 || hour < 6;
      setIsNight(night);
    }

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      // 'pointer-events-none' lets you still click/scroll through the darkness if needed
      className={`fixed inset-0 z-50 transition-all duration-[3000ms] ease-in-out pointer-events-none flex items-center justify-center ${
        isNight ? "bg-black/85 backdrop-blur-sm" : "bg-transparent opacity-0"
      }`}
    >
      {/* Optional: A subtle icon to show the screen is "Sleeping" */}
      <div className={`transition-opacity duration-1000 ${isNight ? "opacity-20" : "opacity-0"}`}>
        <Moon className="w-24 h-24 text-white" />
      </div>
    </div>
  );
}