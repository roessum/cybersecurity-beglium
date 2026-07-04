import { prisma } from "@/lib/prisma";
import { buildStoryHostSnapshot, buildStoryPlayerSnapshot } from "@/lib/game/story";
import type {
  HostSnapshot,
  LeaderboardRow,
  LobbyPlayer,
  PlayerSnapshot,
} from "@/lib/game/types";

type LoadedGame = NonNullable<Awaited<ReturnType<typeof loadGame>>>;

async function loadGame(pin: string) {
  const game = await prisma.game.findUnique({
    where: { pin },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { choices: { orderBy: { order: "asc" } } },
          },
        },
      },
      players: { orderBy: { joinedAt: "asc" } },
    },
  });
  if (!game || !game.quiz) return null;

  const questions = game.quiz.questions;
  const currentQuestion =
    game.currentQuestionIndex >= 0 ? (questions[game.currentQuestionIndex] ?? null) : null;
  const currentAnswers = currentQuestion
    ? await prisma.playerAnswer.findMany({
        where: { gameId: game.id, questionId: currentQuestion.id },
      })
    : [];

  return { game, quiz: game.quiz, questions, currentQuestion, currentAnswers };
}

/** Cheap poll used by the SSE loop to detect changes before rebuilding. */
export async function getStateVersion(pin: string): Promise<number | null> {
  const game = await prisma.game.findUnique({
    where: { pin },
    select: { stateVersion: true },
  });
  return game?.stateVersion ?? null;
}

function buildLeaderboard(core: LoadedGame): LeaderboardRow[] {
  const { game, currentAnswers } = core;
  const pointsThis = new Map<string, number>();
  for (const a of currentAnswers) pointsThis.set(a.playerId, a.pointsAwarded);

  const byCurrent = [...game.players].sort(
    (a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname)
  );
  const byPrior = [...game.players].sort((a, b) => {
    const pa = a.score - (pointsThis.get(a.id) ?? 0);
    const pb = b.score - (pointsThis.get(b.id) ?? 0);
    return pb - pa || a.nickname.localeCompare(b.nickname);
  });
  const priorRank = new Map<string, number>();
  byPrior.forEach((p, i) => priorRank.set(p.id, i + 1));

  return byCurrent.map((p, i) => {
    const rank = i + 1;
    return {
      playerId: p.id,
      nickname: p.nickname,
      emoji: p.emoji,
      score: p.score,
      rank,
      delta: (priorRank.get(p.id) ?? rank) - rank,
    };
  });
}

function toLobbyPlayer(p: LoadedGame["game"]["players"][number]): LobbyPlayer {
  return { id: p.id, nickname: p.nickname, emoji: p.emoji, score: p.score };
}

function correctChoiceId(core: LoadedGame): string | undefined {
  return core.currentQuestion?.choices.find((c) => c.isCorrect)?.id;
}

async function gameKind(pin: string): Promise<"QUIZ" | "STORY" | null> {
  const game = await prisma.game.findUnique({ where: { pin }, select: { kind: true } });
  return game?.kind ?? null;
}

export async function buildHostSnapshot(pin: string): Promise<HostSnapshot | null> {
  if ((await gameKind(pin)) === "STORY") return buildStoryHostSnapshot(pin);

  const core = await loadGame(pin);
  if (!core) return null;
  const { game, quiz, questions, currentQuestion, currentAnswers } = core;

  const snap: HostSnapshot = {
    role: "host",
    kind: "QUIZ",
    stateVersion: game.stateVersion,
    phase: game.status,
    pin: game.pin,
    quizTitle: quiz.title,
    totalQuestions: questions.length,
    questionIndex: game.currentQuestionIndex,
    playerCount: game.players.length,
    players: game.players.map(toLobbyPlayer),
  };

  if ((game.status === "QUESTION" || game.status === "REVEAL") && currentQuestion) {
    snap.question = {
      text: currentQuestion.text,
      timeLimitSec: currentQuestion.timeLimitSec,
      startedAt: game.questionStartedAt?.getTime() ?? Date.now(),
      choices: currentQuestion.choices.map((c) => ({
        id: c.id,
        text: c.text,
        order: c.order,
        isCorrect: c.isCorrect,
      })),
    };
    const perChoice: Record<string, number> = {};
    for (const c of currentQuestion.choices) perChoice[c.id] = 0;
    for (const a of currentAnswers) perChoice[a.choiceId] = (perChoice[a.choiceId] ?? 0) + 1;
    snap.answers = { total: currentAnswers.length, perChoice };
  }

  if (game.status === "REVEAL") {
    snap.correctChoiceId = correctChoiceId(core);
    if (currentQuestion?.explanation) snap.explanation = currentQuestion.explanation;
  }

  if (game.status === "LEADERBOARD" || game.status === "ENDED") {
    snap.leaderboard = buildLeaderboard(core);
  }

  return snap;
}

export async function buildPlayerSnapshot(
  pin: string,
  playerId: string
): Promise<PlayerSnapshot | null> {
  if ((await gameKind(pin)) === "STORY") return buildStoryPlayerSnapshot(pin, playerId);

  const core = await loadGame(pin);
  if (!core) return null;
  const { game, quiz, questions, currentQuestion, currentAnswers } = core;

  const you = game.players.find((p) => p.id === playerId);
  if (!you) return null;

  const snap: PlayerSnapshot = {
    role: "player",
    kind: "QUIZ",
    stateVersion: game.stateVersion,
    phase: game.status,
    pin: game.pin,
    quizTitle: quiz.title,
    totalQuestions: questions.length,
    questionIndex: game.currentQuestionIndex,
    playerCount: game.players.length,
    you: toLobbyPlayer(you),
  };

  if (game.status === "QUESTION" && currentQuestion) {
    snap.question = {
      text: currentQuestion.text,
      timeLimitSec: currentQuestion.timeLimitSec,
      startedAt: game.questionStartedAt?.getTime() ?? Date.now(),
      choices: currentQuestion.choices.map((c) => ({
        id: c.id,
        text: c.text,
        order: c.order,
      })),
    };
    const mine = currentAnswers.find((a) => a.playerId === playerId);
    snap.answered = mine ? { choiceId: mine.choiceId } : null;
  }

  if (game.status === "REVEAL" && currentQuestion) {
    const mine = currentAnswers.find((a) => a.playerId === playerId);
    const board = buildLeaderboard(core);
    snap.result = {
      correct: mine?.isCorrect ?? false,
      correctChoiceId: correctChoiceId(core) ?? "",
      yourChoiceId: mine?.choiceId ?? null,
      pointsAwarded: mine?.pointsAwarded ?? 0,
      yourRank: board.find((r) => r.playerId === playerId)?.rank ?? game.players.length,
    };
    if (currentQuestion.explanation) snap.explanation = currentQuestion.explanation;
  }

  if (game.status === "LEADERBOARD" || game.status === "ENDED") {
    const board = buildLeaderboard(core);
    snap.leaderboard = board;
    snap.yourRank = board.find((r) => r.playerId === playerId)?.rank;
  }

  return snap;
}
