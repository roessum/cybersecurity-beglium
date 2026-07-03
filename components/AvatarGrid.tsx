"use client";

import { AnimatePresence, motion } from "motion/react";
import type { LobbyPlayer } from "@/lib/game/types";

export function AvatarGrid({
  players,
  highlightId,
}: {
  players: LobbyPlayer[];
  highlightId?: string;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <AnimatePresence>
        {players.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.4, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-medium backdrop-blur ${
              p.id === highlightId
                ? "bg-cyan-400/20 ring-2 ring-cyan-400"
                : "bg-white/8 ring-1 ring-white/10"
            }`}
          >
            <span className="text-xl">{p.emoji}</span>
            <span className="max-w-32 truncate">{p.nickname}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
