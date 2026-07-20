"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, Wind, Droplets, MapPin, CloudRain, CloudSnow, CloudLightning, Thermometer, Umbrella } from "lucide-react";
import { motion } from "motion/react";
import { wmoToCondition } from "@/lib/utils";

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
}

interface WeatherData {
  current: {
    temp: number;
    temp_f: number;
    condition: string;
    high: number;
    low: number;
    wind: number;
    humidity: number;
    feels_like: number;
    precip: number;
  };
  weeklyForecast: DailyForecast[];
}


interface WeatherCardProps {
  lat: number;
  lon: number;
  timezone: string;
  cityName: string;
}

export function WeatherCard({ lat, lon, timezone, cityName }: WeatherCardProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}` +
          '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code' +
          '&daily=temperature_2m_max,temperature_2m_min,weather_code' +
          `&wind_speed_unit=kmh&timezone=${encodeURIComponent(timezone)}&forecast_days=6`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const json = await res.json();
        const c = json.current;

        const weeklyForecast: DailyForecast[] = json.daily.time.slice(0, 5).map((dateStr: string, i: number) => ({
          day: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(json.daily.temperature_2m_max[i]),
          low: Math.round(json.daily.temperature_2m_min[i]),
          condition: wmoToCondition(json.daily.weather_code[i]),
        }));

        setData({
          current: {
            temp: Math.round(c.temperature_2m),
            temp_f: Math.round((c.temperature_2m * 9 / 5) + 32),
            condition: wmoToCondition(c.weather_code),
            high: Math.round(json.daily.temperature_2m_max[0]),
            low: Math.round(json.daily.temperature_2m_min[0]),
            wind: Math.round(c.wind_speed_10m),
            humidity: c.relative_humidity_2m,
            feels_like: Math.round(c.apparent_temperature),
            precip: c.precipitation_probability ?? 0,
          },
          weeklyForecast,
        });
      } catch (error) {
        console.error("Weather error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
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
      <div className="h-[400px] bg-white/5 rounded-2xl animate-pulse border border-white/10" />
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
    >
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="size-5 text-amber-400" />
        <div className="text-white/70 text-base font-medium">{cityName}</div>
      </div>

      {/* Secondary Info */}
      <div className="mb-8">
        <div className="text-white/60 text-8xl font-medium">
          {data.current.temp_f}°F
        </div>
        <div className="text-amber-400 text-lg font-medium mt-1 capitalize">
          {data.current.condition}
        </div>
      </div>
      
      {/* Summary Row: High | Low | Feels Like */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* FIX: Changed size-6 to size-5 to match bottom row */}
          <Sun className="size-5 text-amber-400" />
          <div>
            <div className="text-white/50 text-xs font-medium uppercase">High</div>
            {/* FIX: Changed text-xl to text-2xl to match bottom row */}
            <div className="text-white text-2xl font-bold">{data.current.high}°</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Cloud className="size-5 text-blue-400" />
          <div>
            <div className="text-white/50 text-xs font-medium uppercase">Low</div>
            <div className="text-white text-2xl font-bold">{data.current.low}°</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Thermometer className="size-5 text-orange-400" />
          <div>
            <div className="text-white/50 text-xs font-medium uppercase">Feels Like</div>
            <div className="text-white text-2xl font-bold">{data.current.feels_like}°</div>
          </div>
        </div>
      </div>
      
      {/* 5-Day Forecast */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-white/50 text-xs font-medium uppercase mb-3 tracking-wider">5-Day Forecast</div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {data.weeklyForecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="text-white/70 text-xs mb-2 font-bold">{day.day}</div>
              {getWeatherIcon(day.condition, "size-6 text-amber-400 mb-2 opacity-90")}
              <div className="flex flex-col text-sm">
                <span className="text-white font-bold">{day.high}°</span>
                <span className="text-white/40 text-xs">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Metrics */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Droplets className="size-5 text-blue-400" />
            <span className="text-white/50 text-xs uppercase font-medium">Humidity</span>
          </div>
          <div className="text-white text-2xl font-bold">{data.current.humidity}%</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Umbrella className="size-5 text-cyan-400" />
            <span className="text-white/50 text-xs uppercase font-medium">Precip</span>
          </div>
          <div className="text-white text-2xl font-bold">{data.current.precip}%</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wind className="size-5 text-gray-400" />
            <span className="text-white/50 text-xs uppercase font-medium">Wind</span>
          </div>
          <div className="text-white text-2xl font-bold">{data.current.wind} <span className="text-sm font-normal text-white/50">km/h</span></div>
        </div>
      </div>

    </motion.div>
  );
}