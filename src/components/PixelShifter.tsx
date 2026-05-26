"use client";
import { useEffect, useState } from "react";

export function PixelShifter({ children }: { children: React.ReactNode }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Shift every 5 minutes
    const interval = setInterval(() => {
      // Random shift between -2px and 2px
      const x = Math.floor(Math.random() * 5) - 2;
      const y = Math.floor(Math.random() * 5) - 2;
      setOffset({ x, y });
    }, 300000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 1s ease-in-out",
      }}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}