"use client";

import { motion } from "motion/react";
import type { LeaderboardRow } from "@/lib/game/types";

// Indexed by finishing place (0 = winner): the champion's pillar is tallest.
const HEIGHTS = ["h-52", "h-40", "h-32"];
const MEDALS = ["🥇", "🥈", "🥉"];
const ORDER = [1, 0, 2]; // render columns left-to-right as 2nd, 1st, 3rd

export function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const top3 = rows.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-end justify-center gap-4">
        {ORDER.map((idx, col) => {
          const r = top3[idx];
          if (!r) return <div key={col} className="w-24 sm:w-32" />;
          return (
            <motion.div
              key={r.playerId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * col, type: "spring", stiffness: 260, damping: 20 }}
              className="flex w-24 flex-col items-center sm:w-32"
            >
              <span className="text-4xl">{r.emoji}</span>
              <span className="mt-1 max-w-full truncate text-sm font-semibold">{r.nickname}</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {r.score.toLocaleString()}
              </span>
              <div
                className={`mt-2 flex w-full ${HEIGHTS[idx]} items-start justify-center rounded-t-xl bg-linear-to-b from-cyan-400/30 to-emerald-400/10 pt-3 ring-1 ring-white/10`}
              >
                <span className="text-3xl">{MEDALS[idx]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
