"use client";

import { motion } from "motion/react";

const BLOBS = [
  { color: "rgba(34,211,238,0.18)", size: 520, top: "-8%", left: "-6%", dx: 60, dy: 40, dur: 18 },
  { color: "rgba(52,211,153,0.16)", size: 460, top: "50%", left: "70%", dx: -70, dy: -50, dur: 22 },
  { color: "rgba(59,130,246,0.14)", size: 400, top: "70%", left: "10%", dx: 50, dy: -40, dur: 26 },
];

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background: b.color,
            borderRadius: "9999px",
            filter: "blur(80px)",
          }}
        />
      ))}
    </div>
  );
}
