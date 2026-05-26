"use client";

import { useEffect } from "react";

interface AutoRefreshProps {
  intervalMs?: number;
}

export function AutoRefresh({ intervalMs = 5 * 60 * 1000 }: AutoRefreshProps) {
  useEffect(() => {
    const timer = setInterval(() => {
      window.location.reload();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return null;
}
