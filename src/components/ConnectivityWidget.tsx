"use client";

import { useState, useEffect } from "react";

interface ConnectivityData {
  latest: {
    latency: number | null;
    packetLoss: number | null;
    uptime: number | null;
    downloadMbps: number | null;
    uploadMbps: number | null;
    ispName: string | null;
  };
}

// ── Small Circular Gauge ─────────────────────────────────────────────

function Gauge({ value, max, unit, label, color, showDot = false }: {
  value: number | null;
  max: number;
  unit: string;
  label: string;
  color: string;
  showDot?: boolean;
}) {
  const SIZE = 82;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 32;
  const STROKE = 7;
  const circ = 2 * Math.PI * R;
  const pct = Math.min((value ?? 0) / max, 1);
  const offset = circ - pct * circ;

  const angleDeg = pct * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = CX + R * Math.cos(angleRad);
  const dotY = CY + R * Math.sin(angleRad);

  const display = value === null ? "--"
    : Number.isInteger(value) ? String(value)
    : value.toFixed(1);

  return (
    <div className="flex flex-col items-center flex-1">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e2030" strokeWidth={STROKE} />
        {/* Arc */}
        <circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Dot at leading edge */}
        {showDot && pct > 0.01 && (
          <circle cx={dotX} cy={dotY} r="4" fill={color} />
        )}
        {/* Value */}
        <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,1)" fontSize="16" fontWeight="700" fontFamily="inherit">
          {display}
        </text>
        {/* Unit */}
        <text x={CX} y={CY + 12} textAnchor="middle"
          fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="inherit">
          {unit}
        </text>
      </svg>
      <span className="text-white/60 text-[10px] mt-0.5">{label}</span>
    </div>
  );
}

// ── Main Widget ──────────────────────────────────────────────────────

export function ConnectivityWidget() {
  const [data, setData] = useState<ConnectivityData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/connectivity');
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (json.error) throw new Error();
        setData(json);
        setError(false);
      } catch { setError(true); }
    }
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="w-[300px] flex flex-col gap-1 self-start">
        <span className="text-white/20 text-xs">{error ? 'Unavailable' : 'Loading...'}</span>
      </div>
    );
  }

  const d = data.latest;

  return (
    <div className="flex flex-col w-[300px] self-start">

      {/* Gauges */}
      <div className="flex gap-2">
        <Gauge value={d.latency} max={100} unit="ms" label="Latency" color="rgba(255,255,255,0.7)" showDot />
        <Gauge value={d.packetLoss} max={5} unit="%" label="Pkt Loss" color="rgba(255,255,255,0.7)" />
        <Gauge value={d.uptime} max={100} unit="%" label="Uptime" color="rgba(255,255,255,0.7)" />
      </div>

    </div>
  );
}
