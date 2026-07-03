"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useHydrated } from "@/lib/useClient";

const COLORS = ["#22d3ee", "#34d399", "#f43f5e", "#f59e0b", "#38bdf8", "#a78bfa", "#ffffff"];

// Deterministic pseudo-random so render stays pure (no Math.random).
function rand(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ count = 80, loop = false }: { count?: number; loop?: boolean }) {
  const hydrated = useHydrated();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(i * 13.13 + k * 7.7 + 1);
        return {
          id: i,
          left: r(1) * 100,
          size: 6 + r(2) * 8,
          delay: r(3) * (loop ? 3 : 0.6),
          duration: 2.4 + r(4) * 2.2,
          rotate: r(5) * 360,
          repeatDelay: loop ? r(6) * 1.5 : 0,
          color: COLORS[i % COLORS.length],
          round: r(7) > 0.5,
        };
      }),
    [count, loop]
  );

  if (!hydrated) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-10%", opacity: 0, rotate: 0 }}
          animate={{ y: "110%", opacity: [0, 1, 1, 0.9], rotate: p.rotate }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: loop ? Infinity : 0,
            repeatDelay: p.repeatDelay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "2px",
          }}
        />
      ))}
    </div>
  );
}
