"use client";

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { wmoToCondition } from '@/lib/utils';

interface TertiaryWeatherProps {
  lat: number;
  lon: number;
  timezone: string;
  cityName: string;
}

function WeatherIcon({ condition, className }: { condition: string; className: string }) {
  switch (condition?.toLowerCase()) {
    case 'rain': return <CloudRain className={className} />;
    case 'clouds': return <Cloud className={className} />;
    case 'snow': return <CloudSnow className={className} />;
    case 'thunderstorm': return <CloudLightning className={className} />;
    default: return <Sun className={className} />;
  }
}

export function TertiaryWeather({ lat, lon, timezone, cityName }: TertiaryWeatherProps) {
  const [temp, setTemp] = useState<number | null>(null);
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}` +
      `&current=temperature_2m,weather_code&timezone=${encodeURIComponent(timezone)}`
    )
      .then(r => r.json())
      .then(json => {
        setTemp(Math.round(json.current.temperature_2m));
        setCondition(wmoToCondition(json.current.weather_code));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lon, timezone]);

  if (loading) {
    return <div className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/10" />;
  }

  if (temp === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl px-5 py-4 backdrop-blur-sm border border-white/10 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-green-400 flex-shrink-0" />
        <span className="text-white/70 text-sm">{cityName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-sm">{condition}</span>
        <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 15, repeat: Infinity }}>
          <WeatherIcon condition={condition} className="size-5 text-green-300" />
        </motion.div>
        <span className="text-white text-5xl font-medium leading-none">{temp}°C</span>
      </div>
    </motion.div>
  );
}
