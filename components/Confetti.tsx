"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useHydrated } from "@/lib/useClient";

const COLORS = ["#22d3ee", "#34d399", "#f43f5e", "#f59e0b", "#38bdf8", "#a78bfa", "#ffffff"];

// mulberry32 — deterministic (pure) but well-distributed pseudo-random.
function rng(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function Confetti({ count = 90, loop = false }: { count?: number; loop?: boolean }) {
  const hydrated = useHydrated();

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rng(i * 100 + k);
        return {
          id: i,
          left: r(1) * 100, // vw
          drift: (r(2) - 0.5) * 24, // vw sway
          size: 7 + r(3) * 7,
          delay: r(4) * (loop ? 3.5 : 0.5),
          duration: 3 + r(5) * 2.5,
          spin: (r(6) > 0.5 ? 1 : -1) * (240 + r(7) * 360),
          repeatDelay: loop ? r(8) * 2 : 0,
          color: COLORS[Math.floor(r(9) * COLORS.length)],
          round: r(10) > 0.55,
        };
      }),
    [count, loop]
  );

  if (!hydrated) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: "-8vh", left: `${p.left}vw`, opacity: 0, rotate: 0 }}
          animate={{
            top: "108vh",
            left: [`${p.left}vw`, `${p.left + p.drift}vw`, `${p.left}vw`],
            opacity: [0, 1, 1, 1, 0.85],
            rotate: p.spin,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: loop ? Infinity : 0,
            repeatDelay: p.repeatDelay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "2px",
          }}
        />
      ))}
    </div>,
    document.body
  );
}
