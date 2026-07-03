"use client";

import { QRCodeSVG } from "qrcode.react";
import { useHydrated } from "@/lib/useClient";

export function QRJoin({ pin }: { pin: string }) {
  const hydrated = useHydrated();
  const origin = hydrated ? window.location.origin : "";

  const joinPath = `/join?pin=${pin}`;
  const joinUrl = origin ? `${origin}${joinPath}` : joinPath;
  const displayUrl = origin ? origin.replace(/^https?:\/\//, "") : "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-white p-3 shadow-lg">
        {origin ? (
          <QRCodeSVG value={joinUrl} size={168} level="M" />
        ) : (
          <div className="h-42 w-42" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-400">Join at</p>
        <p className="font-mono text-lg text-white">
          {displayUrl}
          <span className="text-slate-500">/join</span>
        </p>
      </div>
    </div>
  );
}
