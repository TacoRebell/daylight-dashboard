"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { UVGauge } from './UVGauge';
import { wmoToCondition } from '@/lib/utils';

interface WeatherState {
  temp: number;
  feelsLike: number;
  condition: string;
  uvIndex: number;
}


interface WelcomeHeaderProps {
  lat: number;
  lon: number;
  timezone: string;
}

export function WelcomeHeader({ lat, lon, timezone }: WelcomeHeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherState | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    const animationFrame = requestAnimationFrame(updateTime);
    const timer = setInterval(updateTime, 1000);
    return () => { cancelAnimationFrame(animationFrame); clearInterval(timer); };
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          '&current=temperature_2m,apparent_temperature,weather_code,uv_index' +
          `&timezone=${encodeURIComponent(timezone)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        const c = json.current;

        setWeather({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          condition: wmoToCondition(c.weather_code),
          uvIndex: Math.round(c.uv_index ?? 0),
        });
      } catch {}
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
  }, [lat, lon, timezone]);

  if (!time) return <div className="h-[140px]" />;

  const getWeatherIcon = (cond: string) => {
    const cls = "size-20 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]";
    switch (cond?.toLowerCase()) {
      case 'rain':        return <CloudRain className={`${cls} text-blue-300`} />;
      case 'clouds':      return <Cloud className={`${cls} text-white/70`} />;
      case 'snow':        return <CloudSnow className={`${cls} text-blue-100`} />;
      case 'thunderstorm':return <CloudLightning className={`${cls} text-amber-400`} />;
      default:            return <Sun className={`${cls} text-amber-400`} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center justify-between px-4 py-6"
    >
      {/* Left: Clock + Date */}
      <div className="flex flex-col">
        <div className="text-[7rem] font-bold text-white tracking-tight tabular-nums leading-none">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <div className="text-white/60 text-xl uppercase tracking-widest font-medium mt-3">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Center: UV Gauge */}
      {weather && (
        <div className="flex items-center justify-center">
          <UVGauge value={weather.uvIndex} size={160} />
        </div>
      )}

      {/* Right: Temperature + condition */}
      {weather && (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {getWeatherIcon(weather.condition)}
            </motion.div>
            <div className="text-[7rem] font-bold text-white tracking-tight leading-none">
              {weather.temp}°
            </div>
          </div>
          <div className="text-white/60 text-xl uppercase tracking-widest font-medium mt-3">
            {weather.condition}, feels like {weather.feelsLike}°
          </div>
        </div>
      )}
    </motion.div>
  );
}
