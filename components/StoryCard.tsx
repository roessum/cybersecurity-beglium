import { CreateGameButton } from "@/components/CreateGameButton";

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  Intermediate: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  Advanced: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
};

export type StorySummary = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  difficulty: string | null;
  visibleWords: number;
  targetWords: number | null;
};

export function StoryCard({ story }: { story: StorySummary }) {
  const badge = story.difficulty
    ? (DIFFICULTY_STYLES[story.difficulty] ?? "bg-white/10 text-slate-300 ring-white/20")
    : null;

  return (
    <div className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:ring-white/20">
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl">{story.icon ?? "📖"}</span>
        <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-medium text-fuchsia-300 ring-1 ring-fuchsia-400/30">
          Story
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{story.title}</h3>
      {story.description && (
        <p className="mt-2 flex-1 text-sm text-slate-400">{story.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300 ring-1 ring-white/10">
          👀 sees {story.visibleWords} word{story.visibleWords === 1 ? "" : "s"}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300 ring-1 ring-white/10">
          {story.targetWords ? `🏁 ${story.targetWords} words` : "♾️ host stops"}
        </span>
        {story.difficulty && badge && (
          <span className={`rounded-full px-3 py-1 font-medium ring-1 ${badge}`}>
            {story.difficulty}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center justify-end">
        <CreateGameButton storyId={story.id} label="Start story" />
      </div>
    </div>
  );
}
