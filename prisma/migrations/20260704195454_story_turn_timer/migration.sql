-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "turnStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "turnSeconds" INTEGER;
