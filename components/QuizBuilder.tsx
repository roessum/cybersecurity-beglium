"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { answerStyle } from "@/lib/game/answerStyles";

const ICONS = [
  "🛡️", "🧹", "🛎️", "💶", "🧑‍💼", "🖥️", "🎣", "🔐",
  "📣", "🏭", "🚚", "📞", "⚖️", "🧪", "💼", "🩺",
];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

type ChoiceDraft = { text: string; correct: boolean };
type QuestionDraft = { text: string; timeLimitSec: number; choices: ChoiceDraft[] };

function newQuestion(): QuestionDraft {
  return {
    text: "",
    timeLimitSec: 20,
    choices: [
      { text: "", correct: true },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ],
  };
}

export function QuizBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🛡️");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Beginner");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function updateQuestion(qi: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }
  function updateChoice(qi: number, ci: number, patch: Partial<ChoiceDraft>) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? { ...q, choices: q.choices.map((c, j) => (j === ci ? { ...c, ...patch } : c)) }
          : q
      )
    );
  }
  function setCorrect(qi: number, ci: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? { ...q, choices: q.choices.map((c, j) => ({ ...c, correct: j === ci })) }
          : q
      )
    );
  }
  function addChoice(qi: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi && q.choices.length < 4
          ? { ...q, choices: [...q.choices, { text: "", correct: false }] }
          : q
      )
    );
  }
  function removeChoice(qi: number, ci: number) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi || q.choices.length <= 2) return q;
        const choices = q.choices.filter((_, j) => j !== ci);
        if (!choices.some((c) => c.correct)) choices[0].correct = true;
        return { ...q, choices };
      })
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Trim empty trailing choices, validate.
    const payloadQuestions = questions.map((q) => ({
      text: q.text.trim(),
      timeLimitSec: q.timeLimitSec,
      choices: q.choices
        .map((c) => ({ text: c.text.trim(), correct: c.correct }))
        .filter((c) => c.text.length > 0),
    }));

    if (!title.trim()) return setError("Give your session a title");
    for (const [i, q] of payloadQuestions.entries()) {
      if (!q.text) return setError(`Question ${i + 1} needs text`);
      if (q.choices.length < 2) return setError(`Question ${i + 1} needs at least two answers`);
      if (q.choices.filter((c) => c.correct).length !== 1)
        return setError(`Question ${i + 1} needs exactly one correct answer marked`);
    }

    setBusy(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          department: department.trim() || null,
          description: description.trim() || null,
          icon,
          difficulty,
          questions: payloadQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create session");
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
      {/* Session details */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold">Session details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-400">Title *</span>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Security on the Ground" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-400">Department</span>
            <input className={input} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Warehouse" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-400">Description</span>
          <input className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line about who this is for" />
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
            <select className={input} value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Questions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
        </div>

        <AnimatePresence initial={false}>
          {questions.map((q, qi) => (
            <motion.div
              key={qi}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-cyan-300">Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                    className="text-sm text-slate-500 hover:text-rose-400"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                className={input}
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                placeholder="What do you want to ask?"
              />

              <div className="flex flex-col gap-2">
                {q.choices.map((c, ci) => {
                  const s = answerStyle(ci);
                  return (
                    <div key={ci} className="flex items-center gap-2">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${s.bg}`}>
                        {s.shape}
                      </span>
                      <input
                        className={`${input} flex-1`}
                        value={c.text}
                        onChange={(e) => updateChoice(qi, ci, { text: e.target.value })}
                        placeholder={`Answer ${ci + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setCorrect(qi, ci)}
                        title="Mark correct"
                        className={`flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition ${
                          c.correct
                            ? "bg-emerald-400 text-black"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {c.correct ? "✓ Correct" : "Correct?"}
                      </button>
                      {q.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(qi, ci)}
                          className="px-1 text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                {q.choices.length < 4 ? (
                  <button
                    type="button"
                    onClick={() => addChoice(qi)}
                    className="text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    + Add answer
                  </button>
                ) : (
                  <span />
                )}
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  Time
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={q.timeLimitSec}
                    onChange={(e) =>
                      updateQuestion(qi, {
                        timeLimitSec: Math.max(5, Math.min(120, Number(e.target.value) || 20)),
                      })
                    }
                    className="w-16 rounded-lg bg-white/5 px-2 py-1 text-center ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
                  />
                  s
                </label>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setQuestions((qs) => [...qs, newQuestion()])}
          className="rounded-2xl border border-dashed border-white/20 py-3 font-medium text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
        >
          + Add question
        </button>
      </section>

      {error && <p className="text-rose-400">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-cyan-400 px-7 py-3 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create session"}
        </button>
      </div>
    </form>
  );
}
