"use client";

import { useEffect, useState } from "react";

export function Timer({
  startedAt,
  timeLimitSec,
  size = 96,
}: {
  startedAt: number;
  timeLimitSec: number;
  size?: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  const total = timeLimitSec * 1000;
  const elapsed = Math.min(Math.max(now - startedAt, 0), total);
  const remaining = Math.max(0, Math.ceil((total - elapsed) / 1000));
  const frac = total > 0 ? 1 - elapsed / total : 0;

  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const urgent = remaining <= 5;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={urgent ? "#f43f5e" : "#22d3ee"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums ${
          urgent ? "text-rose-400" : "text-white"
        }`}
      >
        {remaining}
      </span>
    </div>
  );
}
