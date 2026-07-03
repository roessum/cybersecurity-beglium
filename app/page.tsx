import Link from "next/link";
import { Brand } from "@/components/Brand";

const FEATURES = [
  {
    title: "Phishing & awareness",
    body: "Turn dry security policy into reflexes your team actually remembers.",
    icon: "🎣",
  },
  {
    title: "Live & competitive",
    body: "Kahoot-style rounds with speed scoring, live leaderboards and a winner podium.",
    icon: "⚡",
  },
  {
    title: "Zero friction",
    body: "Players scan a QR code, pick a nickname, and they're in. No apps, no accounts.",
    icon: "🛡️",
  },
];

export default function Home() {
  return (
    <div className="grid-bg flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Brand className="text-xl" />
        <nav className="flex items-center gap-3">
          <Link
            href="/join"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Join a game
          </Link>
          <Link
            href="/host"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
          >
            Host
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-14 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-full bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300 ring-1 ring-cyan-400/30">
            Security awareness, gamified
          </span>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Make cybersecurity training
            <span className="bg-linear-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              {" "}
              impossible to forget
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-400">
            We run live, competitive quizzes at your workshops and events — so phishing,
            passwords and MFA stick with your people long after the session ends.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/host"
              className="rounded-xl bg-cyan-400 px-7 py-3.5 text-lg font-bold text-black transition active:scale-[0.98]"
            >
              Start a live quiz
            </Link>
            <Link
              href="/join"
              className="rounded-xl bg-white/10 px-7 py-3.5 text-lg font-semibold ring-1 ring-white/15 transition hover:bg-white/15"
            >
              I have a PIN
            </Link>
          </div>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white/5 p-6 text-left ring-1 ring-white/10 backdrop-blur"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
        CyberQuiz — live cybersecurity awareness quizzes for teams.
      </footer>
    </div>
  );
}
