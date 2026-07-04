"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ICONS = [
  "📖", "🐙", "🐉", "🚀", "🕵️", "👻", "🧙", "🦄",
  "🌋", "🏰", "🌲", "🎭", "🛸", "🧟", "🐧", "🎃",
];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export function StoryBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📖");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Beginner");
  const [unit, setUnit] = useState<"WORD" | "SENTENCE">("WORD");
  const [visibleWords, setVisibleWords] = useState(1);
  const [hasTarget, setHasTarget] = useState(true);
  const [targetWords, setTargetWords] = useState(30);
  const [hasTimer, setHasTimer] = useState(false);
  const [turnSeconds, setTurnSeconds] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Give your story a title");
    if (hasTarget && targetWords < 2) return setError("Target must be at least 2 words");
    if (hasTimer && turnSeconds < 5) return setError("Turn timer must be at least 5 seconds");

    setBusy(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          icon,
          difficulty,
          unit,
          visibleWords,
          targetWords: hasTarget ? targetWords : null,
          turnSeconds: hasTimer ? turnSeconds : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create story");
        return;
      }
      router.push("/host");
    } catch {
      setError("Network error, try again");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400";

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold">Story details</h2>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-400">Title *</span>
          <input
            className={input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Once Upon a Breach"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-400">Description</span>
          <input
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One line about the story prompt — optional"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-400">Icon</span>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition ${
                    icon === e ? "bg-cyan-400/20 ring-2 ring-cyan-400" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-400">Difficulty</span>
            <select
              className={input}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold">How it plays</h2>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-slate-400">
            Each turn a player adds…
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "WORD", icon: "✏️", label: "One word", blurb: "Classic chaos" },
                { id: "SENTENCE", icon: "📝", label: "A whole sentence", blurb: "Reads like a story" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setUnit(m.id)}
                className={`flex flex-col items-start gap-0.5 rounded-xl p-3 text-left ring-1 transition ${
                  unit === m.id
                    ? "bg-cyan-400/15 ring-2 ring-cyan-400"
                    : "bg-white/5 ring-white/10 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="font-semibold">{m.label}</span>
                <span className="text-xs text-slate-400">{m.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-slate-400">
            {unit === "SENTENCE" ? "Sentences" : "Words"} the writer can see — how many of
            the most recent {unit === "SENTENCE" ? "sentences" : "words"} to reveal on each
            turn. Fewer = more chaos.
          </span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setVisibleWords(n)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold transition ${
                  visibleWords === n
                    ? "bg-cyan-400 text-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={hasTarget}
              onChange={(e) => setHasTarget(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Stop automatically at a {unit === "SENTENCE" ? "sentence" : "word"} count
          </label>
          {hasTarget && (
            <label className="flex items-center gap-2 text-sm text-slate-400">
              Target
              <input
                type="number"
                min={2}
                max={500}
                value={targetWords}
                onChange={(e) =>
                  setTargetWords(Math.max(2, Math.min(500, Number(e.target.value) || 2)))
                }
                className="w-20 rounded-lg bg-white/5 px-2 py-1 text-center ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
              />
              {unit === "SENTENCE" ? "sentences" : "words"}
            </label>
          )}
          {!hasTarget && (
            <span className="text-xs text-slate-500">
              The host ends the story whenever they like from the big screen.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={hasTimer}
              onChange={(e) => setHasTimer(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Turn timer — skip a player if they don&apos;t write in time
          </label>
          {hasTimer && (
            <label className="flex items-center gap-2 text-sm text-slate-400">
              Skip after
              <input
                type="number"
                min={5}
                max={120}
                value={turnSeconds}
                onChange={(e) =>
                  setTurnSeconds(Math.max(5, Math.min(120, Number(e.target.value) || 5)))
                }
                className="w-20 rounded-lg bg-white/5 px-2 py-1 text-center ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
              />
              seconds
            </label>
          )}
        </div>
      </section>

      {error && <p className="text-rose-400">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-cyan-400 px-7 py-3 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create story"}
        </button>
      </div>
    </form>
  );
}
