// Builds a Server-Sent Events response that pushes a fresh snapshot whenever the
// game's stateVersion changes. Postgres is the source of truth, so this works
// across serverless instances; EventSource reconnects transparently if the
// underlying function is recycled.

type SseOptions = {
  /** Cheap poll — returns the current stateVersion, or null if the game is gone. */
  getVersion: () => Promise<number | null>;
  /** Builds the full snapshot to send (called only when the version changed). */
  buildSnapshot: () => Promise<unknown>;
  /** Abort signal from the request; stops the loop when the client disconnects. */
  signal: AbortSignal;
  pollMs?: number;
  heartbeatMs?: number;
};

export function sseResponse(opts: SseOptions): Response {
  const { getVersion, buildSnapshot, signal, pollMs = 600, heartbeatMs = 15000 } = opts;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let lastVersion = -1;
      let lastBeat = Date.now();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      const tick = async () => {
        if (closed) return;
        try {
          const version = await getVersion();
          if (version === null) {
            send("gone", { message: "Game ended" });
            close();
            return;
          }
          if (version !== lastVersion) {
            lastVersion = version;
            const snapshot = await buildSnapshot();
            if (snapshot === null) {
              send("gone", { message: "You are no longer in this game" });
              close();
              return;
            }
            send("snapshot", snapshot);
            lastBeat = Date.now();
          } else if (Date.now() - lastBeat >= heartbeatMs) {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
            lastBeat = Date.now();
          }
        } catch {
          // Transient DB error — keep the stream alive and retry next tick.
        }
      };

      const timer = setInterval(tick, pollMs);
      signal.addEventListener("abort", close);
      // Send the initial snapshot immediately.
      await tick();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
