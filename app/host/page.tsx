import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Brand } from "@/components/Brand";
import { DepartmentCard } from "@/components/DepartmentCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HostPage() {
  const quizzes = await prisma.quiz.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Home
        </Link>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Host a live session</h1>
          <p className="mt-1 text-slate-400">
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

      {quizzes.length === 0 ? (
        <div className="rounded-2xl bg-white/5 p-6 text-slate-400 ring-1 ring-white/10">
          No sessions yet. Run <code className="text-cyan-300">npm run db:seed</code> to add them.
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
        </div>
      )}
    </main>
  );
}
