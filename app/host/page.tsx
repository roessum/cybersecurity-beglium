import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Brand } from "@/components/Brand";
import { CreateGameButton } from "@/components/CreateGameButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HostPage() {
  const quizzes = await prisma.quiz.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Home
        </Link>
      </header>

      <div>
        <h1 className="text-3xl font-bold">Host a live quiz</h1>
        <p className="mt-1 text-slate-400">
          Pick a quiz to open a lobby. Players join from their phones with the PIN.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {quizzes.length === 0 && (
          <li className="rounded-2xl bg-white/5 p-6 text-slate-400 ring-1 ring-white/10">
            No quizzes yet. Run <code className="text-cyan-300">npm run db:seed</code> to add one.
          </li>
        )}
        {quizzes.map((q) => (
          <li
            key={q.id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
          >
            <div>
              <h2 className="text-lg font-semibold">{q.title}</h2>
              {q.description && <p className="text-sm text-slate-400">{q.description}</p>}
              <p className="mt-1 text-xs text-slate-500">{q._count.questions} questions</p>
            </div>
            <CreateGameButton quizId={q.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
