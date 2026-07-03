"use client";

const EMOJIS = [
  "🐱", "🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐧",
  "🦉", "🐬", "🐝", "🦖", "👾", "🤖", "👻", "🎃",
  "🔥", "⚡", "🌈", "🍀", "🚀", "🛡️", "🔑", "💎",
];

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition ${
            value === e
              ? "bg-cyan-400/20 ring-2 ring-cyan-400"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export { EMOJIS };
