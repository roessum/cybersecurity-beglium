"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { QuizBuilder } from "@/components/QuizBuilder";
import { StoryBuilder } from "@/components/StoryBuilder";

type GameType = "quiz" | "story";

const TYPES: { id: GameType; icon: string; label: string; blurb: string }[] = [
  { id: "quiz", icon: "🧠", label: "Quiz", blurb: "Multiple-choice questions, scored on speed." },
  { id: "story", icon: "📖", label: "Story", blurb: "Players add one word at a time to build a story." },
];

export default function NewGamePage() {
  const [type, setType] = useState<GameType>("quiz");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <Link href="/host" className="text-sm text-slate-400 hover:text-white">
          ← Back
        </Link>
      </header>

      <div>
        <h1 className="text-3xl font-bold">Create a session</h1>
        <p className="mt-1 text-slate-400">Pick a game type, then set it up.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`flex flex-col items-start gap-1 rounded-2xl p-5 text-left ring-1 transition ${
              type === t.id
                ? "bg-cyan-400/15 ring-2 ring-cyan-400"
                : "bg-white/5 ring-white/10 hover:bg-white/10"
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-lg font-semibold">{t.label}</span>
            <span className="text-sm text-slate-400">{t.blurb}</span>
          </button>
        ))}
      </div>

      {type === "quiz" ? <QuizBuilder /> : <StoryBuilder />}
    </main>
  );
}
