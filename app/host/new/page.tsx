import Link from "next/link";
import { Brand } from "@/components/Brand";
import { QuizBuilder } from "@/components/QuizBuilder";

export default function NewQuizPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Brand className="text-xl" />
        <Link href="/host" className="text-sm text-slate-400 hover:text-white">
          ← Back
        </Link>
      </header>

      <div>
        <h1 className="text-3xl font-bold">Create a session</h1>
        <p className="mt-1 text-slate-400">
          Build a quiz for any team — add a title, an icon, and your questions.
        </p>
      </div>

      <QuizBuilder />
    </main>
  );
}
