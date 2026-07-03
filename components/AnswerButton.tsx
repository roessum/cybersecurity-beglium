"use client";

import { motion } from "motion/react";
import { answerStyle } from "@/lib/game/answerStyles";

export function AnswerButton({
  order,
  text,
  onClick,
  disabled,
  state = "idle",
}: {
  order: number;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  /** idle = selectable, selected = your pick, correct/wrong = revealed, dim = not chosen */
  state?: "idle" | "selected" | "correct" | "wrong" | "dim";
}) {
  const s = answerStyle(order);
  const stateClass =
    state === "dim"
      ? "opacity-40 saturate-50"
      : state === "wrong"
        ? "ring-4 ring-white/70"
        : state === "correct" || state === "selected"
          ? "ring-4 ring-white"
          : "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`flex min-h-20 w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-lg font-semibold shadow-lg transition disabled:cursor-default ${s.bg} ${s.fg} ${stateClass}`}
    >
      <span className="text-2xl leading-none opacity-90">{s.shape}</span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <span className="text-2xl">✓</span>}
      {state === "wrong" && <span className="text-2xl">✕</span>}
    </motion.button>
  );
}
