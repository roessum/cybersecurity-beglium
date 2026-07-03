// Kahoot-style color + shape coding for answer choices, shared by player and
// host so a given choice always looks the same on both screens.

export type AnswerStyle = {
  shape: string;
  /** Solid background for buttons / bars. */
  bg: string;
  /** Text color that reads on the solid background. */
  fg: string;
  /** Soft translucent variant for the host tallies. */
  soft: string;
};

export const ANSWER_STYLES: AnswerStyle[] = [
  { shape: "▲", bg: "bg-rose-500", fg: "text-white", soft: "bg-rose-500/20 text-rose-300" },
  { shape: "◆", bg: "bg-sky-500", fg: "text-white", soft: "bg-sky-500/20 text-sky-300" },
  { shape: "●", bg: "bg-amber-500", fg: "text-black", soft: "bg-amber-500/20 text-amber-300" },
  { shape: "■", bg: "bg-emerald-500", fg: "text-white", soft: "bg-emerald-500/20 text-emerald-300" },
];

export function answerStyle(order: number): AnswerStyle {
  return ANSWER_STYLES[order % ANSWER_STYLES.length];
}
