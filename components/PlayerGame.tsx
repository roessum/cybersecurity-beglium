"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useGameStream } from "@/lib/useGameStream";
import { useHydrated, useLocalValue } from "@/lib/useClient";
import { AnswerButton } from "@/components/AnswerButton";
import { Leaderboard } from "@/components/Leaderboard";
import { Brand } from "@/components/Brand";
import type { PlayerSnapshot } from "@/lib/game/types";

export function PlayerGame({ pin }: { pin: string }) {
  const hydrated = useHydrated();
  const playerId = useLocalValue(`player:${pin}`);
  // Selection is scoped to a question index so it resets automatically each round.
  const [selected, setSelected] = useState<{ qIndex: number; choiceId: string } | null>(null);
  const submittingRef = useRef(false);

  const url = playerId
    ? `/api/games/${pin}/stream?role=player&playerId=${playerId}`
    : null;
  const { data, gone } = useGameStream<PlayerSnapshot>(url);

  const currentQIndex = data?.phase === "QUESTION" ? data.questionIndex : null;
  const localChoice =
    selected && selected.qIndex === currentQIndex ? selected.choiceId : null;

  async function answer(choiceId: string) {
    if (!playerId || currentQIndex === null || submittingRef.current || localChoice) return;
    submittingRef.current = true;
    setSelected({ qIndex: currentQIndex, choiceId });
    try {
      const res = await fetch(`/api/games/${pin}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, choiceId }),
      });
      if (!res.ok) {
        submittingRef.current = false;
        setSelected(null);
      } else {
        submittingRef.current = false;
      }
    } catch {
      submittingRef.current = false;
      setSelected(null);
    }
  }

  if (hydrated && !playerId) {
    return (
      <Centered>
        <p className="text-slate-300">You haven&apos;t joined this game.</p>
        <Link href={`/join?pin=${pin}`} className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black">
          Join now
        </Link>
      </Centered>
    );
  }

  if (gone) {
    return (
      <Centered>
        <p className="text-2xl font-bold">Game over 👋</p>
        <p className="mt-1 text-slate-400">Thanks for playing!</p>
        <Link href="/" className="mt-6 text-cyan-300 underline">
          Back home
        </Link>
      </Centered>
    );
  }

  if (!data) {
    return (
      <Centered>
        <div className="animate-pulse text-slate-400">Connecting…</div>
      </Centered>
    );
  }

  const answeredChoiceId = data.answered?.choiceId ?? localChoice;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <header className="flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10">
          <span className="text-lg">{data.you.emoji}</span>
          <span className="max-w-24 truncate font-medium">{data.you.nickname}</span>
          <span className="font-bold text-cyan-300 tabular-nums">{data.you.score}</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {data.phase === "LOBBY" && (
            <Panel key="lobby">
              <div className="text-5xl" style={{ animation: "floaty 3s ease-in-out infinite" }}>
                {data.you.emoji}
              </div>
              <h1 className="text-2xl font-bold">You&apos;re in!</h1>
              <p className="text-slate-400">Waiting for the host to start…</p>
              <p className="text-sm text-slate-500">{data.playerCount} players in the lobby</p>
            </Panel>
          )}

          {data.phase === "QUESTION" && data.question && (
            <Panel key={`q-${data.questionIndex}`} align="stretch">
              <p className="text-center text-sm text-slate-400">
                Question {data.questionIndex + 1} / {data.totalQuestions}
              </p>
              <h2 className="text-center text-xl font-semibold">{data.question.text}</h2>
              {answeredChoiceId ? (
                <div className="mt-4 rounded-2xl bg-white/5 py-8 text-center ring-1 ring-white/10">
                  <p className="text-3xl">🔒</p>
                  <p className="mt-2 font-semibold">Answer locked in!</p>
                  <p className="text-sm text-slate-400">Waiting for others…</p>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {data.question.choices.map((c) => (
                    <AnswerButton
                      key={c.id}
                      order={c.order}
                      text={c.text}
                      onClick={() => answer(c.id)}
                    />
                  ))}
                </div>
              )}
            </Panel>
          )}

          {data.phase === "REVEAL" && data.result && (
            <Panel key="reveal">
              <div className={`text-6xl`}>{data.result.correct ? "✅" : "❌"}</div>
              <h2 className="text-2xl font-bold">
                {data.result.correct ? "Correct!" : data.result.yourChoiceId ? "Not quite" : "No answer"}
              </h2>
              {data.result.pointsAwarded > 0 && (
                <p className="text-xl font-semibold text-emerald-400">
                  +{data.result.pointsAwarded.toLocaleString()}
                </p>
              )}
              <p className="text-slate-400">
                You&apos;re #{data.result.yourRank} · {data.you.score.toLocaleString()} pts
              </p>
              {data.explanation && (
                <div className="mt-3 rounded-2xl bg-cyan-400/10 p-4 text-left ring-1 ring-cyan-400/25">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    Why this matters
                  </p>
                  <p className="text-sm text-slate-100">{data.explanation}</p>
                </div>
              )}
            </Panel>
          )}

          {(data.phase === "LEADERBOARD" || data.phase === "ENDED") && data.leaderboard && (
            <Panel key="board" align="stretch">
              <h2 className="text-center text-xl font-bold">
                {data.phase === "ENDED" ? "Final results 🏆" : "Scoreboard"}
              </h2>
              {data.yourRank && (
                <p className="text-center text-slate-400">
                  You finished #{data.yourRank} of {data.playerCount}
                </p>
              )}
              <Leaderboard rows={data.leaderboard} highlightId={data.you.id} max={5} />
              {data.phase === "ENDED" && (
                <Link href="/" className="mt-4 text-center text-cyan-300 underline">
                  Back home
                </Link>
              )}
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Panel({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "center" | "stretch";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : ""}`}
    >
      {children}
    </motion.div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      {children}
    </main>
  );
}
