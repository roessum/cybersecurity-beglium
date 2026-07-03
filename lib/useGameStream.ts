"use client";

import { useEffect, useState } from "react";

export type StreamState<T> = {
  data: T | null;
  connected: boolean;
  gone: boolean;
};

/**
 * Subscribes to a game SSE stream. `EventSource` reconnects automatically, so
 * this survives serverless function recycling and brief network drops.
 * Pass `null` to stay disconnected.
 */
export function useGameStream<T>(url: string | null): StreamState<T> {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  // Track which url reported "gone" so a new url is considered live again,
  // without resetting state synchronously inside the effect.
  const [goneUrl, setGoneUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url);

    es.addEventListener("snapshot", (e) => {
      try {
        setData(JSON.parse((e as MessageEvent).data) as T);
        setConnected(true);
      } catch {
        // ignore malformed frame
      }
    });
    es.addEventListener("gone", () => {
      setGoneUrl(url);
      es.close();
    });
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    return () => es.close();
  }, [url]);

  return { data, connected, gone: goneUrl !== null && goneUrl === url };
}
