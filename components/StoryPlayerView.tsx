"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Timer } from "@/components/Timer";
import type { PlayerSnapshot } from "@/lib/game/types";

export function StoryPlayerView({
  pin,
  data,
  playerId,
}: {
  pin: string;
  data: PlayerSnapshot;
  playerId: string;
}) {
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const story = data.story;

  // Reset the input whenever it stops being our turn (a new turn = fresh field).
  const yourTurn = data.phase === "WRITING" && !!story?.yourTurn;
  const sentence = story?.unit === "SENTENCE";
  const noun = sentence ? "sentence" : "word";

  async function submit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const clean = word.trim();
    if (!clean || submittingRef.current || !yourTurn) return;
    submittingRef.current = true;
    setError(null);
    try {
      const res = await fetch(`/api/games/${pin}/word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, word: clean }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not send your word");
      } else {
        setWord("");
      }
    } catch {
      setError("Network error, try again");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <header className="flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10">
          <span className="text-lg">{data.you.emoji}</span>
          <span className="max-w-24 truncate font-medium">{data.you.nickname}</span>
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
              <p className="text-slate-400">Waiting for the host to start the story…</p>
              <p className="text-sm text-slate-500">{data.playerCount} players in the lobby</p>
            </Panel>
          )}

          {data.phase === "WRITING" && yourTurn && (
            <Panel key="your-turn" align="stretch">
              <p className="text-center text-sm font-semibold uppercase tracking-wide text-cyan-300">
                Your turn ✍️
              </p>
              {story?.turnSeconds && story.turnStartedAt != null && (
                <div className="flex justify-center">
                  <Timer
                    startedAt={story.turnStartedAt}
                    timeLimitSec={story.turnSeconds}
                    size={64}
                  />
                </div>
              )}
              <div className="rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10">
                {story && story.visibleWords.length > 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {story.visibleWords.length === 1 ? `Previous ${noun}` : `Last ${noun}s`}
                    </p>
                    <p className={`mt-1 font-bold ${sentence ? "text-lg" : "text-2xl"}`}>
                      {story.visibleWords.join(" ")}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-slate-300">
                    You start the story — write the first {noun}!
                  </p>
                )}
              </div>

              <form onSubmit={submit} className="mt-2 flex flex-col gap-3">
                {sentence ? (
                  <textarea
                    autoFocus
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) submit(e);
                    }}
                    placeholder="Write a sentence…"
                    rows={2}
                    maxLength={280}
                    className="w-full resize-none rounded-2xl bg-white/5 px-5 py-4 text-lg outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
                  />
                ) : (
                  <input
                    autoFocus
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="One word…"
                    autoComplete="off"
                    autoCapitalize="none"
                    className="w-full rounded-2xl bg-white/5 px-5 py-4 text-center text-2xl outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
                  />
                )}
                <button
                  type="submit"
                  disabled={!word.trim()}
                  className="rounded-2xl bg-cyan-400 py-4 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
                >
                  Add {noun} →
                </button>
                {error && <p className="text-center text-sm text-rose-400">{error}</p>}
              </form>
            </Panel>
          )}

          {data.phase === "WRITING" && !yourTurn && (
            <Panel key="waiting">
              <div className="text-5xl">⏳</div>
              <h2 className="text-xl font-bold">
                {story?.currentWriter
                  ? `${story.currentWriter.emoji} ${story.currentWriter.nickname} is writing…`
                  : "Someone is writing…"}
              </h2>
              <p className="text-slate-400">
                {story?.wordCount ?? 0} {noun}
                {(story?.wordCount ?? 0) === 1 ? "" : "s"} so far
              </p>
              <p className="text-sm text-slate-500">Get ready — your turn is coming!</p>
            </Panel>
          )}

          {data.phase === "ENDED" && (
            <Panel key="ended" align="stretch">
              <h2 className="text-center text-xl font-bold">The story 📖</h2>
              <div className="max-h-[55vh] overflow-y-auto rounded-2xl bg-white/5 p-5 text-lg leading-relaxed ring-1 ring-white/10">
                {story?.fullStory ? (
                  <p>“{story.fullStory}”</p>
                ) : (
                  <p className="text-slate-500">The story was empty.</p>
                )}
              </div>
              <p className="text-center text-sm text-slate-500">
                {story?.wordCount ?? 0} {noun}
                {(story?.wordCount ?? 0) === 1 ? "" : "s"} · {data.playerCount} authors
              </p>
              <Link href="/" className="mt-2 text-center text-cyan-300 underline">
                Back home
              </Link>
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
