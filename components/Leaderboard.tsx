"use client";

import { motion } from "motion/react";
import type { LeaderboardRow } from "@/lib/game/types";

function Delta({ delta }: { delta: number }) {
  if (delta === 0)
    return <span className="text-xs text-slate-500">—</span>;
  const up = delta > 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

export function Leaderboard({
  rows,
  highlightId,
  max = 8,
}: {
  rows: LeaderboardRow[];
  highlightId?: string;
  max?: number;
}) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {rows.slice(0, max).map((r) => (
        <motion.li
          key={r.playerId}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
            r.playerId === highlightId
              ? "bg-cyan-400/15 ring-2 ring-cyan-400"
              : "bg-white/5 ring-1 ring-white/10"
          }`}
        >
          <span className="w-6 text-center text-lg font-bold text-slate-400">{r.rank}</span>
          <span className="text-2xl">{r.emoji}</span>
          <span className="flex-1 truncate font-semibold">{r.nickname}</span>
          <Delta delta={r.delta} />
          <span className="w-20 text-right font-bold tabular-nums text-cyan-300">
            {r.score.toLocaleString()}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
