// Shared snapshot types sent over SSE to player and host clients.

export type Phase =
  | "LOBBY"
  | "QUESTION"
  | "REVEAL"
  | "LEADERBOARD"
  | "WRITING"
  | "ENDED";

export type GameKind = "QUIZ" | "STORY";

/** Host-side view of the word-story game. */
export type StoryHostState = {
  wordCount: number;
  targetWords: number | null;
  /** Who is writing right now (WRITING phase). */
  currentWriter?: { nickname: string; emoji: string };
  /** The full assembled story — only sent once the game has ENDED. */
  fullStory?: string;
};

/** Player-side view of the word-story game. */
export type StoryPlayerState = {
  yourTurn: boolean;
  /** The last N words, oldest→newest. Only meaningful while it's your turn. */
  visibleWords: string[];
  wordCount: number;
  targetWords: number | null;
  currentWriter?: { nickname: string; emoji: string };
  /** The full assembled story — only sent once the game has ENDED. */
  fullStory?: string;
};

export type PublicChoice = {
  id: string;
  text: string;
  order: number;
};

export type HostChoice = PublicChoice & {
  isCorrect: boolean;
};

export type LeaderboardRow = {
  playerId: string;
  nickname: string;
  emoji: string;
  score: number;
  rank: number;
  /** Rank movement caused by the most recent question. Positive = moved up. */
  delta: number;
};

export type LobbyPlayer = {
  id: string;
  nickname: string;
  emoji: string;
  score: number;
};

export type PlayerSnapshot = {
  role: "player";
  kind: GameKind;
  stateVersion: number;
  phase: Phase;
  pin: string;
  quizTitle: string;
  totalQuestions: number;
  questionIndex: number;
  playerCount: number;
  you: LobbyPlayer;
  question?: {
    text: string;
    timeLimitSec: number;
    startedAt: number;
    choices: PublicChoice[];
  };
  /** During QUESTION: the choice this player has locked in, if any. */
  answered?: { choiceId: string } | null;
  /** During REVEAL: this player's result for the question just played. */
  result?: {
    correct: boolean;
    correctChoiceId: string;
    yourChoiceId: string | null;
    pointsAwarded: number;
    yourRank: number;
  };
  /** During REVEAL: why the correct answer matters. */
  explanation?: string;
  /** During LEADERBOARD / ENDED. */
  leaderboard?: LeaderboardRow[];
  yourRank?: number;
  /** Present when kind === "STORY". */
  story?: StoryPlayerState;
};

export type HostSnapshot = {
  role: "host";
  kind: GameKind;
  stateVersion: number;
  phase: Phase;
  pin: string;
  quizTitle: string;
  totalQuestions: number;
  questionIndex: number;
  playerCount: number;
  players: LobbyPlayer[];
  question?: {
    text: string;
    timeLimitSec: number;
    startedAt: number;
    choices: HostChoice[];
  };
  /** During QUESTION / REVEAL: live answer tallies. */
  answers?: {
    total: number;
    perChoice: Record<string, number>;
  };
  correctChoiceId?: string;
  /** During REVEAL: why the correct answer matters. */
  explanation?: string;
  leaderboard?: LeaderboardRow[];
  /** Present when kind === "STORY". */
  story?: StoryHostState;
};

export type Snapshot = PlayerSnapshot | HostSnapshot;
