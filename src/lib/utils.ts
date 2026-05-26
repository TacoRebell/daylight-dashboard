import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// WMO weather interpretation code → condition string
export function wmoToCondition(code: number): string {
  if (code <= 1) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code <= 48) return 'Clouds'; // fog
  if (code <= 67 || (code >= 80 && code <= 82)) return 'Rain';
  if (code <= 77 || (code >= 85 && code <= 86)) return 'Snow';
  return 'Thunderstorm'; // 95, 96, 99
}