"use client";

import Image from "next/image";

export function BackgroundLayer() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* 1. The Local Background Image */}
      <Image
        alt="Background"
        src="/bg.jpg" // <--- Points to public/background.jpg
        fill
        className="object-cover object-center opacity-95"
        priority
        // We can remove the explicit 'quality' prop to use Next.js defaults
      />

      {/* 2. The Overlay Gradient (The "Tint") */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121]/80 via-[#0B1121]/90 to-[#0B1121]" />
      
      {/* 3. Optional: Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
    </div>
  );
}