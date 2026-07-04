"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { QRJoin } from "@/components/QRJoin";
import { AvatarGrid } from "@/components/AvatarGrid";
import { Timer } from "@/components/Timer";
import { Confetti } from "@/components/Confetti";
import { AmbientBackground } from "@/components/AmbientBackground";
import type { HostSnapshot } from "@/lib/game/types";

export function StoryHostView({
  data,
  control,
  busy,
}: {
  data: HostSnapshot;
  control: (action: "advance" | "end" | "skip") => void;
  busy: boolean;
}) {
  const story = data.story;
  const target = story?.targetWords ?? null;
  const count = story?.wordCount ?? 0;
  const turnSeconds = story?.turnSeconds ?? null;
  const turnStartedAt = story?.turnStartedAt;

  // The host big screen drives the per-turn timer: when it runs out, skip to the
  // next player. Keyed on turnStartedAt so it fires at most once per turn.
  const skippedRef = useRef<number>(0);
  useEffect(() => {
    if (data.phase !== "WRITING" || !turnSeconds || turnStartedAt == null) return;
    if (skippedRef.current === turnStartedAt) return;
    const msLeft = turnStartedAt + turnSeconds * 1000 - Date.now();
    const fire = () => {
      if (skippedRef.current === turnStartedAt) return;
      skippedRef.current = turnStartedAt;
      control("skip");
    };
    if (msLeft <= 0) {
      fire();
      return;
    }
    const t = setTimeout(fire, msLeft);
    return () => clearTimeout(t);
  }, [data.phase, turnSeconds, turnStartedAt, control]);

  // ENDED — the big reveal.
  if (data.phase === "ENDED") {
    return (
      <main className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 px-6 py-10">
        <AmbientBackground />
        <Confetti count={120} loop />
        <Brand className="text-2xl" />
        <h1 className="text-4xl font-bold">📖 {data.quizTitle}</h1>
        <p className="text-slate-400">{count} words · {data.playerCount} authors</p>
        <div className="max-h-[55vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white/5 p-8 text-2xl leading-relaxed ring-1 ring-white/10">
          {story?.fullStory ? (
            <p>
              <span className="text-3xl">“</span>
              {story.fullStory}
              <span className="text-3xl">”</span>
            </p>
          ) : (
            <p className="text-slate-500">The story was empty.</p>
          )}
        </div>
        <Link href="/host" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black">
          Host a new game
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col px-8 py-6 sm:px-12">
      <AmbientBackground />
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <div className="flex items-center gap-3">
          <span className="mr-1 text-sm text-slate-400">📖 {data.quizTitle}</span>
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

          {data.phase === "WRITING" && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <div>
                <p className="text-8xl font-black tabular-nums text-white sm:text-9xl">{count}</p>
                <p className="mt-1 text-lg text-slate-400">
                  {target ? `words of ${target}` : "words so far"}
                </p>
              </div>

              {target && (
                <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 transition-all"
                    style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
                  />
                </div>
              )}

              {turnSeconds && turnStartedAt != null && (
                <Timer startedAt={turnStartedAt} timeLimitSec={turnSeconds} size={72} />
              )}

              {story?.currentWriter ? (
                <motion.p
                  key={story.currentWriter.nickname}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-semibold"
                >
                  ✍️ <span className="text-3xl">{story.currentWriter.emoji}</span>{" "}
                  {story.currentWriter.nickname} is writing…
                </motion.p>
              ) : (
                <p className="text-slate-400">Waiting…</p>
              )}

              <p className="max-w-md text-sm text-slate-500">
                The story stays secret until the end — no peeking! 🤫
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <button
          onClick={() => control("end")}
          className="text-sm text-slate-500 transition hover:text-rose-400"
        >
          {data.phase === "WRITING" ? "Stop & reveal" : "End game"}
        </button>
        {data.phase === "LOBBY" ? (
          <button
            onClick={() => control("advance")}
            disabled={busy || data.playerCount === 0}
            className="rounded-xl bg-cyan-400 px-8 py-3 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
          >
            Start story →
          </button>
        ) : (
          <button
            onClick={() => control("skip")}
            disabled={busy}
            className="rounded-xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-50"
          >
            Skip turn ⏭
          </button>
        )}
      </footer>
    </main>
  );
}
