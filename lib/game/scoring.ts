// Kahoot-style scoring: correctness gates points, speed sets the bonus.
// A correct answer earns between basePoints/2 (at the buzzer) and basePoints
// (instant). Wrong answers earn 0.

export function computeScore(params: {
  isCorrect: boolean;
  responseMs: number;
  timeLimitMs: number;
  basePoints: number;
}): number {
  const { isCorrect, responseMs, timeLimitMs, basePoints } = params;
  if (!isCorrect) return 0;
  const frac = Math.min(Math.max(responseMs / timeLimitMs, 0), 1);
  const score = basePoints * (1 - 0.5 * frac);
  return Math.round(Math.max(score, basePoints / 2));
}
