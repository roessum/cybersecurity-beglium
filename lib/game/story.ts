import { prisma } from "@/lib/prisma";
import { generateHostToken, generatePin } from "@/lib/game/pin";
import { GameError } from "@/lib/game/state";
import type { HostSnapshot, PlayerSnapshot } from "@/lib/game/types";

/** A single word may not contain whitespace (one word per turn) and is length-capped. */
export const MAX_WORD_LENGTH = 40;
/** A sentence may contain spaces but is still length-capped. */
export const MAX_SENTENCE_LENGTH = 280;

/** Trim and collapse internal whitespace to single spaces. */
export function cleanEntry(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Create a live session backing a Story template. Mirrors createGame(). */
export async function createStoryGame(storyId: string) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new GameError("Story not found", 404);

  for (let attempt = 0; attempt < 5; attempt++) {
    const pin = generatePin();
    const existing = await prisma.game.findUnique({ where: { pin } });
    if (existing) continue;
    const game = await prisma.game.create({
      data: { pin, kind: "STORY", storyId, hostToken: generateHostToken() },
    });
    return { pin: game.pin, hostToken: game.hostToken };
  }
  throw new GameError("Could not allocate a game PIN, try again", 500);
}

type StoryGame = {
  id: string;
  status: string;
  currentTurnPlayerId: string | null;
  story: { targetWords: number | null } | null;
  players: { id: string }[];
};

/** Round-robin: the player after `currentId` in join order, wrapping around. */
function nextPlayerId(players: { id: string }[], currentId: string | null): string | null {
  if (players.length === 0) return null;
  const idx = players.findIndex((p) => p.id === currentId);
  // Unknown / null current → start at the first player.
  const next = idx < 0 ? 0 : (idx + 1) % players.length;
  return players[next].id;
}

/** The active player adds one word or sentence, then the turn passes on. */
export async function submitWord(pin: string, playerId: string, rawWord: string) {
  const text = cleanEntry(rawWord);
  if (!text) throw new GameError("Write something first", 400);

  const game = await prisma.game.findUnique({
    where: { pin },
    include: {
      story: { select: { targetWords: true, unit: true } },
      players: { orderBy: { joinedAt: "asc" }, select: { id: true } },
    },
  });
  if (!game) throw new GameError("Game not found", 404);
  if (game.kind !== "STORY" || !game.story) throw new GameError("Not a story game", 400);
  if (game.status !== "WRITING") throw new GameError("Not accepting entries right now", 409);
  if (game.currentTurnPlayerId !== playerId) throw new GameError("It's not your turn", 409);

  if (game.story.unit === "WORD") {
    if (/\s/.test(text)) throw new GameError("One word at a time, please", 400);
    if (text.length > MAX_WORD_LENGTH) throw new GameError("That word is too long", 400);
  } else if (text.length > MAX_SENTENCE_LENGTH) {
    throw new GameError("That sentence is too long", 400);
  }
  const word = text;

  const count = await prisma.storyWord.count({ where: { gameId: game.id } });
  const nextCount = count + 1;
  const reachedTarget =
    game.story?.targetWords != null && nextCount >= game.story.targetWords;

  const nextTurn = reachedTarget ? null : nextPlayerId(game.players, playerId);

  await prisma.$transaction(async (tx) => {
    await tx.storyWord.create({
      data: { gameId: game.id, playerId, order: count, text: word },
    });
    await tx.game.update({
      where: { id: game.id },
      data: {
        currentTurnPlayerId: nextTurn,
        turnStartedAt: reachedTarget ? null : new Date(),
        status: reachedTarget ? "ENDED" : "WRITING",
        stateVersion: { increment: 1 },
      },
    });
  });

  return { wordCount: nextCount, ended: reachedTarget };
}

/** Host-only: pass the turn to the next player without adding a word (e.g. AFK). */
export async function skipTurn(pin: string, hostToken: string) {
  const game = await prisma.game.findUnique({
    where: { pin },
    include: { players: { orderBy: { joinedAt: "asc" }, select: { id: true } } },
  });
  if (!game) throw new GameError("Game not found", 404);
  if (game.hostToken !== hostToken) throw new GameError("Not authorized", 403);
  if (game.kind !== "STORY" || game.status !== "WRITING") return;

  const nextTurn = nextPlayerId(game.players, game.currentTurnPlayerId);
  await prisma.game.update({
    where: { id: game.id },
    data: {
      currentTurnPlayerId: nextTurn,
      turnStartedAt: new Date(),
      stateVersion: { increment: 1 },
    },
  });
}

// ---------------------------------------------------------------------------
// Snapshot builders — dispatched from lib/game/snapshot.ts for STORY games.
// ---------------------------------------------------------------------------

async function loadStoryGame(pin: string) {
  const game = await prisma.game.findUnique({
    where: { pin },
    include: {
      story: true,
      players: { orderBy: { joinedAt: "asc" } },
      storyWords: { orderBy: { order: "asc" } },
    },
  });
  if (!game || !game.story) return null;
  return game;
}

type LoadedStory = NonNullable<Awaited<ReturnType<typeof loadStoryGame>>>;

function assembleStory(words: LoadedStory["storyWords"]): string {
  return words.map((w) => w.text).join(" ");
}

function writerOf(game: LoadedStory): { nickname: string; emoji: string } | undefined {
  const p = game.players.find((pl) => pl.id === game.currentTurnPlayerId);
  return p ? { nickname: p.nickname, emoji: p.emoji } : undefined;
}

export async function buildStoryHostSnapshot(pin: string): Promise<HostSnapshot | null> {
  const game = await loadStoryGame(pin);
  if (!game || !game.story) return null;

  const snap: HostSnapshot = {
    role: "host",
    kind: "STORY",
    stateVersion: game.stateVersion,
    phase: game.status,
    pin: game.pin,
    quizTitle: game.story.title,
    totalQuestions: 0,
    questionIndex: -1,
    playerCount: game.players.length,
    players: game.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      emoji: p.emoji,
      score: p.score,
    })),
    story: {
      unit: game.story.unit,
      wordCount: game.storyWords.length,
      targetWords: game.story.targetWords,
      turnSeconds: game.story.turnSeconds,
      turnStartedAt:
        game.status === "WRITING" ? (game.turnStartedAt?.getTime() ?? undefined) : undefined,
      currentWriter: game.status === "WRITING" ? writerOf(game) : undefined,
      // Keep the story hidden until the reveal.
      fullStory: game.status === "ENDED" ? assembleStory(game.storyWords) : undefined,
    },
  };
  return snap;
}

export async function buildStoryPlayerSnapshot(
  pin: string,
  playerId: string
): Promise<PlayerSnapshot | null> {
  const game = await loadStoryGame(pin);
  if (!game || !game.story) return null;

  const you = game.players.find((p) => p.id === playerId);
  if (!you) return null;

  const yourTurn = game.status === "WRITING" && game.currentTurnPlayerId === playerId;
  const visible = yourTurn
    ? game.storyWords.slice(-game.story.visibleWords).map((w) => w.text)
    : [];

  const snap: PlayerSnapshot = {
    role: "player",
    kind: "STORY",
    stateVersion: game.stateVersion,
    phase: game.status,
    pin: game.pin,
    quizTitle: game.story.title,
    totalQuestions: 0,
    questionIndex: -1,
    playerCount: game.players.length,
    you: { id: you.id, nickname: you.nickname, emoji: you.emoji, score: you.score },
    story: {
      unit: game.story.unit,
      yourTurn,
      visibleWords: visible,
      wordCount: game.storyWords.length,
      targetWords: game.story.targetWords,
      turnSeconds: game.story.turnSeconds,
      turnStartedAt:
        game.status === "WRITING" ? (game.turnStartedAt?.getTime() ?? undefined) : undefined,
      currentWriter: game.status === "WRITING" ? writerOf(game) : undefined,
      fullStory: game.status === "ENDED" ? assembleStory(game.storyWords) : undefined,
    },
  };
  return snap;
}
