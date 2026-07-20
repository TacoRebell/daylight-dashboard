"use client";

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, MapPin, CloudSnow, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';
import { wmoToCondition } from '@/lib/utils';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    high: number;
    low: number;
    wind: number;
    humidity: number;
  };
}

interface SecondaryClockWeatherProps {
  lat: number;
  lon: number;
  timezone: string;
  cityName: string;
}

export function SecondaryClockWeather({ lat, lon, timezone, cityName }: SecondaryClockWeatherProps) {
  const [time, setTime] = useState(new Date());
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}` +
          '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
          '&daily=temperature_2m_max,temperature_2m_min' +
          `&wind_speed_unit=kmh&timezone=${encodeURIComponent(timezone)}&forecast_days=1`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const json = await res.json();
        const c = json.current;

        setData({
          current: {
            temp: Math.round(c.temperature_2m),
            condition: wmoToCondition(c.weather_code),
            high: Math.round(json.daily.temperature_2m_max[0]),
            low: Math.round(json.daily.temperature_2m_min[0]),
            wind: Math.round(c.wind_speed_10m),
            humidity: c.relative_humidity_2m,
          },
        });
      } catch (error) {
        console.error("Secondary weather error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon, timezone]);

  const getWeatherIcon = (condition: string, className: string) => {
    switch (condition?.toLowerCase()) {
      case 'rain': return <CloudRain className={className} />;
      case 'clouds': return <Cloud className={className} />;
      case 'snow': return <CloudSnow className={className} />;
      case 'thunderstorm': return <CloudLightning className={className} />;
      default: return <Sun className={className} />;
    }
  };

  if (loading) {
    return (
      <div className="h-[350px] bg-white/5 rounded-2xl animate-pulse border border-white/10" />
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="size-4 text-blue-400" />
        <div className="text-white/70 text-sm">{cityName}</div>
        <motion.div
          className="ml-auto"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          {getWeatherIcon(data.current.condition, "size-16 text-blue-300")}
        </motion.div>
      </div>

      {/* Clock and Weather */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div className="text-5xl text-white font-medium leading-none">
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: timezone,
            })}
          </div>
          <div className="text-5xl text-white font-medium leading-none">
            {data.current.temp}°
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-white/60 text-sm">
            {time.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              timeZone: timezone,
            })}
          </div>
          <div className="text-white/70 text-sm">{data.current.condition}</div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-yellow-400" />
          <div>
            <div className="text-white/50 text-xs">High</div>
            <div className="text-white">{data.current.high}°</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain className="size-4 text-blue-400" />
          <div>
            <div className="text-white/50 text-xs">Low</div>
            <div className="text-white">{data.current.low}°</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="size-4 text-gray-400" />
          <div>
            <div className="text-white/50 text-xs">Wind</div>
            <div className="text-white">{data.current.wind} km/h</div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
