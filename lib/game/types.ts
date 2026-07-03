// Shared snapshot types sent over SSE to player and host clients.

export type Phase = "LOBBY" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "ENDED";

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
  /** During LEADERBOARD / ENDED. */
  leaderboard?: LeaderboardRow[];
  yourRank?: number;
};

export type HostSnapshot = {
  role: "host";
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
  leaderboard?: LeaderboardRow[];
};

export type Snapshot = PlayerSnapshot | HostSnapshot;
