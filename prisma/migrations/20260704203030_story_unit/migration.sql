-- CreateEnum
CREATE TYPE "StoryUnit" AS ENUM ('WORD', 'SENTENCE');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "unit" "StoryUnit" NOT NULL DEFAULT 'WORD';
