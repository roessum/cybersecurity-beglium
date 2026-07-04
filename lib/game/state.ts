import { prisma } from "@/lib/prisma";
import { generateHostToken, generatePin } from "@/lib/game/pin";
import { computeScore } from "@/lib/game/scoring";

export class GameError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export async function createGame(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { questions: true } } },
  });
  if (!quiz) throw new GameError("Quiz not found", 404);
  if (quiz._count.questions === 0) throw new GameError("Quiz has no questions", 400);

  // Retry a few times in the unlikely event of a PIN collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const pin = generatePin();
    const existing = await prisma.game.findUnique({ where: { pin } });
    if (existing) continue;
    const game = await prisma.game.create({
      data: { pin, quizId, hostToken: generateHostToken() },
    });
    return { pin: game.pin, hostToken: game.hostToken };
  }
  throw new GameError("Could not allocate a game PIN, try again", 500);
}

export async function joinGame(pin: string, nickname: string, emoji: string) {
  const game = await prisma.game.findUnique({ where: { pin } });
  if (!game) throw new GameError("Game not found", 404);
  if (game.status !== "LOBBY") throw new GameError("This game has already started", 409);

  const clean = nickname.trim();
  const existing = await prisma.player.findUnique({
    where: { gameId_nickname: { gameId: game.id, nickname: clean } },
  });
  if (existing) throw new GameError("That nickname is taken, pick another", 409);

  const player = await prisma.$transaction(async (tx) => {
    const created = await tx.player.create({
      data: { gameId: game.id, nickname: clean, emoji },
    });
    await tx.game.update({
      where: { id: game.id },
      data: { stateVersion: { increment: 1 } },
    });
    return created;
  });
  return { playerId: player.id };
}

async function questionCount(quizId: string) {
  return prisma.question.count({ where: { quizId } });
}

/**
 * Advance the game one step through the state machine:
 * LOBBY → QUESTION(0) → REVEAL → LEADERBOARD → QUESTION(1) → … → ENDED
 */
export async function advanceGame(pin: string, hostToken: string) {
  const game = await prisma.game.findUnique({
    where: { pin },
    include: { players: { orderBy: { joinedAt: "asc" }, select: { id: true } } },
  });
  if (!game) throw new GameError("Game not found", 404);
  if (game.hostToken !== hostToken) throw new GameError("Not authorized", 403);

  // Story games have their own flow: LOBBY → WRITING (turn-based) → ENDED.
  // The only host "advance" is starting the game; words/skip/stop drive the rest.
  if (game.kind === "STORY") {
    if (game.status !== "LOBBY") return;
    if (game.players.length === 0) throw new GameError("Wait for players to join", 400);
    await prisma.game.update({
      where: { id: game.id },
      data: {
        status: "WRITING",
        currentTurnPlayerId: game.players[0].id,
        stateVersion: { increment: 1 },
      },
    });
    return;
  }

  if (!game.quizId) throw new GameError("Game has no quiz", 400);
  const total = await questionCount(game.quizId);

  const now = new Date();
  let data: {
    status: typeof game.status;
    currentQuestionIndex?: number;
    questionStartedAt?: Date | null;
  };

  switch (game.status) {
    case "LOBBY":
      data = { status: "QUESTION", currentQuestionIndex: 0, questionStartedAt: now };
      break;
    case "QUESTION":
      data = { status: "REVEAL" };
      break;
    case "REVEAL":
      data = { status: "LEADERBOARD" };
      break;
    case "LEADERBOARD": {
      const next = game.currentQuestionIndex + 1;
      if (next < total) {
        data = { status: "QUESTION", currentQuestionIndex: next, questionStartedAt: now };
      } else {
        data = { status: "ENDED", questionStartedAt: null };
      }
      break;
    }
    case "ENDED":
      return; // terminal, no-op
    default:
      return; // WRITING is story-only, handled above
  }

  await prisma.game.update({
    where: { id: game.id },
    data: { ...data, stateVersion: { increment: 1 } },
  });
}

export async function endGame(pin: string, hostToken: string) {
  const game = await prisma.game.findUnique({ where: { pin } });
  if (!game) throw new GameError("Game not found", 404);
  if (game.hostToken !== hostToken) throw new GameError("Not authorized", 403);
  if (game.status === "ENDED") return;
  await prisma.game.update({
    where: { id: game.id },
    data: { status: "ENDED", questionStartedAt: null, stateVersion: { increment: 1 } },
  });
}

export async function submitAnswer(pin: string, playerId: string, choiceId: string) {
  const game = await prisma.game.findUnique({
    where: { pin },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { choices: true },
          },
        },
      },
    },
  });
  if (!game || !game.quiz) throw new GameError("Game not found", 404);
  if (game.status !== "QUESTION" || game.currentQuestionIndex < 0 || !game.questionStartedAt) {
    throw new GameError("Not accepting answers right now", 409);
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player || player.gameId !== game.id) throw new GameError("Player not in this game", 403);

  const question = game.quiz.questions[game.currentQuestionIndex];
  const choice = question?.choices.find((c) => c.id === choiceId);
  if (!question || !choice) throw new GameError("Invalid choice", 400);

  const already = await prisma.playerAnswer.findUnique({
    where: { playerId_questionId: { playerId, questionId: question.id } },
  });
  if (already) throw new GameError("You already answered this question", 409);

  const responseMs = Math.max(0, Date.now() - game.questionStartedAt.getTime());
  const isCorrect = choice.isCorrect;
  const pointsAwarded = computeScore({
    isCorrect,
    responseMs,
    timeLimitMs: question.timeLimitSec * 1000,
    basePoints: question.basePoints,
  });

  await prisma.$transaction(async (tx) => {
    await tx.playerAnswer.create({
      data: {
        gameId: game.id,
        playerId,
        questionId: question.id,
        choiceId,
        isCorrect,
        pointsAwarded,
        responseMs,
      },
    });
    if (pointsAwarded > 0) {
      await tx.player.update({
        where: { id: playerId },
        data: { score: { increment: pointsAwarded } },
      });
    }
    await tx.game.update({
      where: { id: game.id },
      data: { stateVersion: { increment: 1 } },
    });
  });

  return { correct: isCorrect, pointsAwarded };
}
