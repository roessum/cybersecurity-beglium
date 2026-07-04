import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Brand } from "@/components/Brand";
import { DepartmentCard } from "@/components/DepartmentCard";
import { StoryCard } from "@/components/StoryCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const [quizzes, stories] = await Promise.all([
    prisma.quiz.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.story.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  const isEmpty = quizzes.length === 0 && stories.length === 0;

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

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-14">
        <section className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300 ring-1 ring-cyan-400/30">
            Security awareness, gamified
          </span>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Training that fits
            <span className="bg-linear-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              {" "}
              every team
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-400">
            From the cleaning crew to the red team, each department faces different
            threats — so each gets its own live session, pitched at the right level.
          </p>
          <Link
            href="/join"
            className="rounded-xl bg-cyan-400 px-7 py-3.5 text-lg font-bold text-black transition active:scale-[0.98]"
          >
            I have a PIN
          </Link>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Choose a session</h2>
              <p className="text-slate-400">
                Pick a department to open a lobby. Players join from their phones with the PIN.
              </p>
            </div>
            <Link
              href="/host/new"
              className="rounded-xl bg-emerald-400 px-5 py-2.5 font-bold text-black transition active:scale-[0.98]"
            >
              + Create session
            </Link>
          </div>

          {isEmpty ? (
            <div className="rounded-2xl bg-white/5 p-6 text-slate-400 ring-1 ring-white/10">
              No sessions yet. Run <code className="text-cyan-300">npm run db:seed</code> to
              load the department quizzes.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((q) => (
                <DepartmentCard
                  key={q.id}
                  quiz={{
                    id: q.id,
                    title: q.title,
                    description: q.description,
                    department: q.department,
                    icon: q.icon,
                    difficulty: q.difficulty,
                    questionCount: q._count.questions,
                  }}
                />
              ))}
              {stories.map((s) => (
                <StoryCard
                  key={s.id}
                  story={{
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    icon: s.icon,
                    difficulty: s.difficulty,
                    visibleWords: s.visibleWords,
                    targetWords: s.targetWords,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
        MaybeMalware Quiz — live cybersecurity awareness quizzes for teams.
      </footer>
    </div>
  );
}
