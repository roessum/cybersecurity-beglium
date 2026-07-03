"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useGameStream } from "@/lib/useGameStream";
import { useHydrated, useLocalValue } from "@/lib/useClient";
import { Brand } from "@/components/Brand";
import { Timer } from "@/components/Timer";
import { QRJoin } from "@/components/QRJoin";
import { AvatarGrid } from "@/components/AvatarGrid";
import { Leaderboard } from "@/components/Leaderboard";
import { Podium } from "@/components/Podium";
import { Confetti } from "@/components/Confetti";
import { AmbientBackground } from "@/components/AmbientBackground";
import { useHostSounds } from "@/lib/useHostSounds";
import { unlockAudio } from "@/lib/sound";
import { answerStyle } from "@/lib/game/answerStyles";
import type { HostSnapshot } from "@/lib/game/types";

export function HostView({ pin }: { pin: string }) {
  const hydrated = useHydrated();
  const stored = useLocalValue(`host:${pin}`);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const busyRef = useRef(false);

  const urlToken = hydrated
    ? new URLSearchParams(window.location.search).get("t")
    : null;
  const hostToken = stored ?? urlToken;
  const noToken = hydrated && !hostToken;

  // Persist a token arriving via the URL so refreshes keep working.
  useEffect(() => {
    if (urlToken && !stored) localStorage.setItem(`host:${pin}`, urlToken);
  }, [urlToken, stored, pin]);

  const url = hostToken
    ? `/api/games/${pin}/stream?role=host&hostToken=${hostToken}`
    : null;
  const { data, gone } = useGameStream<HostSnapshot>(url);
  useHostSounds(data ?? null, muted);

  const control = useCallback(
    async (action: "advance" | "end") => {
      if (!hostToken || busyRef.current) return;
      unlockAudio(); // browsers need a gesture before audio can play
      busyRef.current = true;
      setBusy(true);
      try {
        await fetch(`/api/games/${pin}/advance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostToken, action }),
        });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [hostToken, pin]
  );

  // Auto-reveal a question once everyone has answered or the timer runs out —
  // so the host isn't forced to click through each round. Guarded so it fires
  // at most once per question.
  const autoAdvancedRef = useRef<string>("");
  const phase = data?.phase;
  const questionIndex = data?.questionIndex;
  const answeredTotal = data?.answers?.total ?? 0;
  const playerCount = data?.playerCount ?? 0;
  const startedAt = data?.question?.startedAt;
  const timeLimitSec = data?.question?.timeLimitSec;

  useEffect(() => {
    if (phase !== "QUESTION" || questionIndex == null || startedAt == null || !timeLimitSec) {
      return;
    }
    const key = `q${questionIndex}`;
    const fire = () => {
      if (autoAdvancedRef.current === key) return;
      autoAdvancedRef.current = key;
      control("advance");
    };

    if (playerCount > 0 && answeredTotal >= playerCount) {
      fire();
      return;
    }
    const msLeft = startedAt + timeLimitSec * 1000 - Date.now();
    if (msLeft <= 0) {
      fire();
      return;
    }
    const t = setTimeout(fire, msLeft);
    return () => clearTimeout(t);
  }, [phase, questionIndex, answeredTotal, playerCount, startedAt, timeLimitSec, control]);

  if (noToken) {
    return (
      <Centered>
        <p className="text-xl">This host session isn&apos;t available on this device.</p>
        <Link href="/host" className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black">
          Host a new game
        </Link>
      </Centered>
    );
  }

  if (gone || data?.phase === "ENDED") {
    const board = data?.leaderboard ?? [];
    return (
      <main className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-10 px-6 py-10">
        <AmbientBackground />
        {board.length > 0 && <Confetti count={120} loop />}
        <Brand className="text-2xl" />
        <h1 className="text-4xl font-bold">🏆 {data?.quizTitle ?? "Quiz"} — Champions</h1>
        {board.length > 0 && <Podium rows={board} />}
        {board.length > 3 && (
          <div className="w-full max-w-xl">
            <Leaderboard rows={board.slice(3)} max={5} />
          </div>
        )}
        <Link href="/host" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black">
          Host a new game
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <Centered>
        <div className="animate-pulse text-slate-400">Loading game…</div>
      </Centered>
    );
  }

  const lastQuestion = data.questionIndex >= data.totalQuestions - 1;
  const controlLabel: Record<string, string> = {
    LOBBY: "Start game",
    QUESTION: "Reveal answers",
    REVEAL: "Show scoreboard",
    LEADERBOARD: lastQuestion ? "Show podium" : "Next question",
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col px-8 py-6 sm:px-12">
      <AmbientBackground />
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <div className="flex items-center gap-3">
          <span className="mr-1 text-sm text-slate-400">{data.quizTitle}</span>
          <button
            onClick={() => {
              unlockAudio();
              setMuted((m) => !m);
            }}
            title={muted ? "Unmute" : "Mute"}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg ring-1 ring-white/10 transition hover:bg-white/10"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen?.().catch(() => {});
            }}
            title="Toggle fullscreen"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg ring-1 ring-white/10 transition hover:bg-white/10"
          >
            ⛶
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {data.phase === "LOBBY" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-12">
                <div className="text-center">
                  <p className="text-slate-400">Game PIN</p>
                  <p className="font-mono text-7xl font-black tracking-widest text-white sm:text-8xl">
                    {data.pin}
                  </p>
                </div>
                <QRJoin pin={data.pin} />
              </div>
              <div className="w-full">
                <p className="mb-3 text-center text-lg text-slate-300">
                  {data.playerCount} {data.playerCount === 1 ? "player" : "players"} joined
                </p>
                {data.playerCount === 0 ? (
                  <p className="text-center text-slate-500">Waiting for players to join…</p>
                ) : (
                  <AvatarGrid players={data.players} />
                )}
              </div>
            </motion.div>
          )}

          {(data.phase === "QUESTION" || data.phase === "REVEAL") && data.question && (
            <motion.div
              key={`q-${data.questionIndex}-${data.phase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              {data.phase === "REVEAL" && <Confetti key={`c-${data.questionIndex}`} count={60} />}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/5 px-4 py-1 text-sm ring-1 ring-white/10">
                  Question {data.questionIndex + 1} / {data.totalQuestions}
                </span>
                {data.phase === "QUESTION" && (
                  <span className="text-slate-400">
                    <span className="text-2xl font-bold text-white">{data.answers?.total ?? 0}</span>{" "}
                    / {data.playerCount} answered
                  </span>
                )}
              </div>

              <h1 className="text-center text-3xl font-bold sm:text-4xl">{data.question.text}</h1>

              {data.phase === "QUESTION" && (
                <div className="flex justify-center">
                  <Timer
                    startedAt={data.question.startedAt}
                    timeLimitSec={data.question.timeLimitSec}
                  />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {data.question.choices.map((c) => {
                  const s = answerStyle(c.order);
                  const isCorrect = data.phase === "REVEAL" && c.id === data.correctChoiceId;
                  const dim = data.phase === "REVEAL" && !isCorrect;
                  const count = data.answers?.perChoice[c.id] ?? 0;
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-semibold shadow ${s.bg} ${s.fg} ${
                        dim ? "opacity-40 saturate-50" : ""
                      } ${isCorrect ? "ring-4 ring-white" : ""}`}
                    >
                      <span className="text-2xl">{s.shape}</span>
                      <span className="flex-1">{c.text}</span>
                      {data.phase === "REVEAL" && (
                        <span className="rounded-full bg-black/25 px-3 py-0.5 text-sm tabular-nums">
                          {count}
                        </span>
                      )}
                      {isCorrect && <span className="text-2xl">✓</span>}
                    </div>
                  );
                })}
              </div>

              {data.phase === "REVEAL" && data.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mx-auto max-w-3xl rounded-2xl bg-cyan-400/10 p-5 text-center ring-1 ring-cyan-400/25"
                >
                  <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-cyan-300">
                    Why this matters
                  </p>
                  <p className="text-lg text-slate-100">{data.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {data.phase === "LEADERBOARD" && data.leaderboard && (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto flex w-full max-w-2xl flex-col gap-5"
            >
              <h1 className="text-center text-3xl font-bold">Scoreboard</h1>
              <Leaderboard rows={data.leaderboard} max={8} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <button
          onClick={() => control("end")}
          className="text-sm text-slate-500 transition hover:text-rose-400"
        >
          End game
        </button>
        <button
          onClick={() => control("advance")}
          disabled={busy}
          className="rounded-xl bg-cyan-400 px-8 py-3 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
        >
          {controlLabel[data.phase] ?? "Next"} →
        </button>
      </footer>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      {children}
    </main>
  );
}
