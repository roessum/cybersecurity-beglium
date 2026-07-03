import { CreateGameButton } from "@/components/CreateGameButton";

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  Intermediate: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  Advanced: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
};

export type DepartmentQuiz = {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  icon: string | null;
  difficulty: string | null;
  questionCount: number;
};

export function DepartmentCard({ quiz }: { quiz: DepartmentQuiz }) {
  const badge = quiz.difficulty
    ? (DIFFICULTY_STYLES[quiz.difficulty] ?? "bg-white/10 text-slate-300 ring-white/20")
    : null;

  return (
    <div className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:ring-white/20">
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl">{quiz.icon ?? "🛡️"}</span>
        {quiz.difficulty && badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${badge}`}>
            {quiz.difficulty}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{quiz.department ?? quiz.title}</h3>
      {quiz.department && <p className="text-sm text-cyan-300/80">{quiz.title}</p>}
      {quiz.description && (
        <p className="mt-2 flex-1 text-sm text-slate-400">{quiz.description}</p>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">{quiz.questionCount} questions</span>
        <CreateGameButton quizId={quiz.id} label="Start session" />
      </div>
    </div>
  );
}
