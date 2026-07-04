"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateGameButton({
  quizId,
  storyId,
  label = "Start hosting",
}: {
  quizId?: string;
  storyId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyId ? { storyId } : { quizId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create game");
        setBusy(false);
        return;
      }
      localStorage.setItem(`host:${data.pin}`, data.hostToken);
      router.push(`/host/${data.pin}?t=${data.hostToken}`);
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={create}
        disabled={busy}
        className="rounded-xl bg-cyan-400 px-6 py-2.5 font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Starting…" : label}
      </button>
      {error && <span className="text-sm text-rose-400">{error}</span>}
    </div>
  );
}
