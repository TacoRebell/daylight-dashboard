"use client";

import { useState, useEffect } from "react";

interface ConnectivityData {
  latest: {
    latency: number | null;
    packetLoss: number | null;
    uptime: number | null;
  };
}

// ── Circular Gauge ───────────────────────────────────────────────────

interface GaugeProps {
  value: number | null;
  max: number;
  unit: string;
  label: string;
  color: string;
  showDot?: boolean;
}

function Gauge({ value, max, unit, label, color, showDot = false }: GaugeProps) {
  const SIZE = 140;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 54;
  const STROKE = 10;
  const circ = 2 * Math.PI * R;

  const safeVal = value ?? 0;
  const pct = Math.min(safeVal / max, 1);
  const offset = circ - pct * circ;

  // Leading-edge dot position (arc starts at top = -90°)
  const angleDeg = pct * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = CX + R * Math.cos(angleRad);
  const dotY = CY + R * Math.sin(angleRad);

  const display = value === null ? "--"
    : Number.isInteger(value) ? value
    : value.toFixed(1);

  return (
    <div className="flex flex-col items-center flex-1 bg-white/5 rounded-2xl p-5 border border-white/8">
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none" stroke="#1e2030" strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
          />
          {/* Leading-edge dot */}
          {showDot && pct > 0 && (
            <circle cx={dotX} cy={dotY} r="6" fill={color} />
          )}
          {/* Value */}
          <text
            x={CX} y={CY - 8}
            textAnchor="middle" dominantBaseline="middle"
            fill={color}
            fontSize="30"
            fontWeight="700"
            fontFamily="inherit"
          >
            {display}
          </text>
          {/* Unit */}
          <text
            x={CX} y={CY + 20}
            textAnchor="middle"
            fill={color}
            fontSize="13"
            opacity="0.6"
            fontFamily="inherit"
          >
            {unit}
          </text>
        </svg>
      </div>
      <span className="text-white/50 text-sm mt-1">{label}</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function InternetGauges() {
  const [data, setData] = useState<ConnectivityData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/connectivity");
        if (!res.ok) return;
        const json = await res.json();
        if (!json.error) setData(json);
      } catch {}
    }
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const d = data?.latest;

  const latencyColor = !d || d.latency === null ? "#4b5563"
    : d.latency < 50 ? "#22c55e"
    : d.latency < 100 ? "#f59e0b"
    : "#ef4444";

  const pktColor = !d || d.packetLoss === null ? "#4b5563"
    : d.packetLoss < 1 ? "#22c55e"
    : d.packetLoss < 3 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="flex gap-4">
      <Gauge
        value={d?.latency ?? null}
        max={100}
        unit="ms"
        label="Latency"
        color={latencyColor}
        showDot
      />
      <Gauge
        value={d?.packetLoss ?? null}
        max={5}
        unit="%"
        label="Packet Loss"
        color={pktColor}
      />
      <Gauge
        value={d?.uptime ?? null}
        max={100}
        unit="%"
        label="Uptime"
        color="#60a5fa"
      />
    </div>
  );
}
