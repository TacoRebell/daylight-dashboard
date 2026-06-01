"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Quote {
  text: string;
  author: string;
}

export function QuoteSection({ items }: { items: Quote[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3600000);
    return () => clearInterval(timer);
  }, [items.length]);

  const currentQuote = items[index] || { text: "Loading...", author: "" };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex items-center justify-center py-4 min-h-[60px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="px-6 text-center max-w-5xl mx-auto"
        >
          <span className="text-lg md:text-xl text-white/90 font-medium tracking-tight">
            {/* FIX: Escaped quotes using HTML entities */}
            &ldquo;{currentQuote.text}&rdquo;
          </span>
          {currentQuote.author && (
            <span className="ml-3 text-white/50 text-sm font-bold uppercase tracking-wider">
              &mdash; {currentQuote.author}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}