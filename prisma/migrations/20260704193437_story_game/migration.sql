-- CreateEnum
CREATE TYPE "GameKind" AS ENUM ('QUIZ', 'STORY');

-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'WRITING';

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_quizId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentTurnPlayerId" TEXT,
ADD COLUMN     "kind" "GameKind" NOT NULL DEFAULT 'QUIZ',
ADD COLUMN     "storyId" TEXT,
ALTER COLUMN "quizId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "difficulty" TEXT,
    "visibleWords" INTEGER NOT NULL DEFAULT 1,
    "targetWords" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryWord" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryWord_gameId_idx" ON "StoryWord"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryWord_gameId_order_key" ON "StoryWord"("gameId", "order");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryWord" ADD CONSTRAINT "StoryWord_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryWord" ADD CONSTRAINT "StoryWord_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
