"use client";

const SEGMENTS = [
  { from: 135, to: 180, color: "#22c55e" },
  { from: 180, to: 225, color: "#84cc16" },
  { from: 225, to: 270, color: "#eab308" },
  { from: 270, to: 315, color: "#f97316" },
  { from: 315, to: 360, color: "#ef4444" },
  { from: 360, to: 405, color: "#a855f7" },
];

const MAX_UV = 11;
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => i * 45);

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const [sx, sy] = polar(cx, cy, r, from);
  const [ex, ey] = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

export function UVGauge({ value, size = 120 }: { value: number; size?: number }) {
  const cx = 60, cy = 60, r = 46;
  const clamped = Math.min(Math.max(value, 0), MAX_UV);
  const indicatorAngle = 135 + (clamped / MAX_UV) * 270;
  const [ix, iy] = polar(cx, cy, r, indicatorAngle);

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
      {/* Background track */}
      <path
        d={arc(cx, cy, r, 135, 405)}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Colored arc segments */}
      {SEGMENTS.map(({ from, to, color }) => (
        <path
          key={from}
          d={arc(cx, cy, r, from, to)}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      ))}

      {/* Indicator dot */}
      <circle
        cx={ix}
        cy={iy}
        r="5"
        fill="white"
        style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,0.9))" }}
      />

      {/* UV number */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="31"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {value}
      </text>

      {/* Sun icon */}
      <g transform={`translate(${cx}, ${cy + 23})`}>
        <circle r="3" fill="#fbbf24" />
        {SUN_RAYS.map(deg => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={+(Math.cos(rad) * 5).toFixed(2)}
              y1={+(Math.sin(rad) * 5).toFixed(2)}
              x2={+(Math.cos(rad) * 7.5).toFixed(2)}
              y2={+(Math.sin(rad) * 7.5).toFixed(2)}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}
