"use client";

interface MessageProps {
  text: string;
  author: string;
}

export function MessageWidget({ text, author }: MessageProps) {
  const isFamily = author === "Family";

  return (
    // CHANGED: h-48 -> h-32 (Compact height)
    // CHANGED: p-8 -> p-4 (Reduced padding to fit the tighter box)
    <div className="flex flex-col justify-center items-center p-4 bg-surface rounded-3xl border border-white/10 w-full h-32 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-2 text-center max-w-4xl">
        <p className="text-xl font-medium leading-relaxed text-white tracking-wide line-clamp-2">
          {text}
        </p>
        
        {!isFamily && (
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            — {author}
          </span>
        )}
      </div>
    </div>
  );
}