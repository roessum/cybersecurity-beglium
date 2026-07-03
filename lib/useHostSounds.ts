"use client";

import { useEffect, useRef } from "react";
import { sounds } from "@/lib/sound";
import type { HostSnapshot } from "@/lib/game/types";

/** Plays host-screen cues on phase changes, player joins, and the final seconds. */
export function useHostSounds(data: HostSnapshot | null, muted: boolean) {
  const prevPhase = useRef<string | null>(null);
  const prevCount = useRef(0);
  const lastTick = useRef(-1);

  const phase = data?.phase ?? null;
  const playerCount = data?.playerCount ?? 0;
  const startedAt = data?.question?.startedAt;
  const timeLimitSec = data?.question?.timeLimitSec;

  // Phase transitions + lobby join blips.
  useEffect(() => {
    if (phase !== prevPhase.current) {
      if (!muted) {
        if (phase === "QUESTION") sounds.questionStart();
        else if (phase === "REVEAL") sounds.reveal();
        else if (phase === "LEADERBOARD") sounds.leaderboard();
        else if (phase === "ENDED") sounds.podium();
      }
      prevPhase.current = phase;
      lastTick.current = -1;
    }
    if (phase === "LOBBY" && playerCount > prevCount.current && !muted) sounds.join();
    prevCount.current = playerCount;
  }, [phase, playerCount, muted]);

  // Tick during the last 5 seconds of a question.
  useEffect(() => {
    if (muted || phase !== "QUESTION" || startedAt == null || !timeLimitSec) return;
    const id = setInterval(() => {
      const remaining = Math.ceil((startedAt + timeLimitSec * 1000 - Date.now()) / 1000);
      if (remaining <= 5 && remaining > 0 && remaining !== lastTick.current) {
        lastTick.current = remaining;
        sounds.tick();
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, startedAt, timeLimitSec, muted]);
}
