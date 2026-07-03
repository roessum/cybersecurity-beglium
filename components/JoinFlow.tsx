"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Brand } from "@/components/Brand";
import { EmojiPicker, EMOJIS } from "@/components/EmojiPicker";

type Step = "pin" | "identity";

export function JoinFlow({ initialPin = "" }: { initialPin?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialPin ? "identity" : "pin");
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter the 6-digit game PIN");
      return;
    }
    setStep("identity");
  }

  async function submitJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/games/${pin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, emoji }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join");
        if (res.status === 404) setStep("pin");
        return;
      }
      localStorage.setItem(`player:${pin}`, data.playerId);
      router.push(`/play/${pin}`);
    } catch {
      setError("Network error, try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <Brand className="justify-center text-2xl" />

      {step === "pin" && (
        <motion.form
          onSubmit={submitPin}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <label className="text-center text-slate-400">Enter game PIN</label>
          <input
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            className="w-full rounded-2xl bg-white/5 py-5 text-center text-4xl font-bold tracking-[0.3em] tabular-nums outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
          />
          <button
            type="submit"
            className="rounded-2xl bg-cyan-400 py-4 text-lg font-bold text-black transition active:scale-[0.98]"
          >
            Enter
          </button>
        </motion.form>
      )}

      {step === "identity" && (
        <motion.form
          onSubmit={submitJoin}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          <div className="text-center text-slate-400">
            Game <span className="font-mono font-bold text-white">{pin}</span>
          </div>
          <input
            autoFocus
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            placeholder="Your nickname"
            className="w-full rounded-2xl bg-white/5 py-4 text-center text-2xl font-semibold outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
          />
          <div>
            <p className="mb-2 text-center text-sm text-slate-400">
              Pick your avatar <span className="text-3xl align-middle">{emoji}</span>
            </p>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>
          <button
            type="submit"
            disabled={busy || nickname.trim().length === 0}
            className="rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "Joining…" : "Join game"}
          </button>
        </motion.form>
      )}

      {error && <p className="text-center text-rose-400">{error}</p>}
    </main>
  );
}
