export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-emerald-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Zm0 4.2 4 1.5V11c0 3.3-2 5.8-4 7.2V6.2Z" />
        </svg>
      </span>
      <span className="text-lg">
        Maybe<span className="text-cyan-300">Malware</span>
      </span>
    </div>
  );
}
