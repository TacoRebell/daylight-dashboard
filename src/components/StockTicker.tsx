"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockData } from '@/lib/stocks';

interface StockTickerProps {
  items: StockData[];
}

interface ConnectivityLatest {
  latency: number | null;
  packetLoss: number | null;
  uptime: number | null;
}

function NetStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full flex-shrink-0 ${good ? 'bg-green-400' : 'bg-red-400'}`} />
      <span className="text-white/50 text-sm font-semibold tracking-widest uppercase">{label}</span>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}

export function StockTicker({ items = [] }: StockTickerProps) {
  const [net, setNet] = useState<ConnectivityLatest | null>(null);

  useEffect(() => {
    async function fetchNet() {
      try {
        const res = await fetch('/api/connectivity');
        if (!res.ok) return;
        const json = await res.json();
        if (!json.error) setNet(json.latest);
      } catch {}
    }
    fetchNet();
    const id = setInterval(fetchNet, 30_000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) return null;

  const tickerItems = [...items, ...items, ...items, ...items];

  const latency = net?.latency ?? null;
  const loss = net?.packetLoss ?? null;
  const uptime = net?.uptime ?? null;

  const latencyOk = latency !== null && latency < 80;
  const lossOk = loss !== null && loss < 2;
  const uptimeOk = uptime !== null && uptime >= 99;

  const latencyStr = latency !== null ? `${latency} ms` : '--';
  const lossStr = loss !== null ? `${loss}%` : '--';
  const uptimeStr = uptime !== null ? `${Math.round(uptime)}%` : '--';

  return (
    <>
      <style jsx global>{`
        @keyframes scroll-ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker-scroll {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: scroll-ticker 40s linear infinite;
        }
        .animate-ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="fixed bottom-0 left-0 right-0 h-12 bg-[#0a0a0a] border-t border-white/10 z-50 flex items-center overflow-hidden"
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
      >
        {/* Network stats — fixed left panel */}
        <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#0a0a0a] px-5 flex items-center gap-5 border-r border-white/10 shadow-[5px_0_10px_rgba(0,0,0,0.5)]">
          <NetStat label="NET" value={latencyStr} good={latencyOk} />
          <NetStat label="LOSS" value={lossStr} good={lossOk} />
          <NetStat label="UP" value={uptimeStr} good={uptimeOk} />
        </div>

        {/* Scrolling stocks */}
        <div className="animate-ticker-scroll flex pl-[310px]">
          {tickerItems.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap mx-6">
              <span className="text-white/80 font-bold text-base">{stock.symbol}</span>
              <span className="text-white text-base font-mono">{stock.price.toFixed(2)}</span>
              <div className={`flex items-center text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
