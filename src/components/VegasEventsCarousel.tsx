"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, MapPin, Ticket } from 'lucide-react';
import type { VegasArtist } from '@/lib/vegasEvents';

const CACHE_KEY = 'vegas_events_carousel_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;
const SLIDE_INTERVAL = 6000;

function getCache(): VegasArtist[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, artists } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) return artists;
  } catch {}
  return null;
}

function setCache(artists: VegasArtist[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), artists }));
  } catch {}
}

function ArtistCard({ artist }: { artist: VegasArtist }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111118]">
      {/* Image — solid placeholder bg so image loads don't flash */}
      <div className="w-full h-40 flex-shrink-0 overflow-hidden bg-[#1a1a24]">
        {artist.image ? (
          <img
            src={artist.image.url}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-black text-white/10 uppercase">{artist.name[0]}</span>
          </div>
        )}
      </div>

      {/* Details — fully below the image */}
      <div className="px-3 py-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-white font-bold text-base leading-tight truncate">{artist.name}</span>
          <span className="flex-shrink-0 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {artist.showCount} {artist.showCount === 1 ? 'show' : 'shows'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Ticket className="size-3.5 text-orange-400 flex-shrink-0" />
          <span className="text-orange-300 text-sm font-semibold truncate">{artist.dateRange}</span>
        </div>
        {artist.venues.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-white/40 flex-shrink-0" />
            <span className="text-white/50 text-xs truncate">
              {artist.venues.slice(0, 2).join(' · ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const VISIBLE = 3;

export function VegasEventsCarousel() {
  const [artists, setArtists] = useState<VegasArtist[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const cached = getCache();
    if (cached && cached.length > 0) {
      setArtists(cached);
      setLoading(false);
      return;
    }
    fetch('/api/vegas-events')
      .then((r) => r.json())
      .then((data) => {
        if (data.artists?.length) {
          setCache(data.artists);
          setArtists(data.artists);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const advance = useCallback(() => {
    setOffset((o) => (o + 1) % artists.length);
  }, [artists.length]);

  useEffect(() => {
    if (artists.length <= VISIBLE || paused) return;
    intervalRef.current = setInterval(advance, SLIDE_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [artists.length, paused, advance]);

  if (loading) {
    return (
      <div className="h-[240px] bg-[#0d0d18] rounded-2xl border border-white/10" />
    );
  }

  if (artists.length === 0) return null;

  const visible = Array.from({ length: VISIBLE }, (_, i) => artists[(offset + i) % artists.length]);
  const totalDots = Math.min(artists.length, 10);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d18]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <Music2 className="size-4 text-orange-400" />
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Vegas Live</span>
        <span className="text-white/30 text-xs">· next 6 months</span>
        <span className="ml-auto text-white/30 text-xs">{artists.length} artists</span>
      </div>

      {/* Cards row — translate only, no opacity change to avoid brightness pulse */}
      <div className="overflow-hidden px-4 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={offset}
            initial={{ x: 60 }}
            animate={{ x: 0 }}
            exit={{ x: -60 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid grid-cols-3 gap-4"
          >
            {visible.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 pb-3">
        {Array.from({ length: totalDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setOffset(i); setPaused(false); }}
            className={`rounded-full transition-all duration-300 ${
              i === offset % totalDots
                ? 'w-4 h-1.5 bg-orange-400'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
        {artists.length > 10 && (
          <span className="text-white/20 text-xs ml-1">+{artists.length - 10}</span>
        )}
      </div>
    </div>
  );
}
