-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "department" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "icon" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_department_key" ON "Quiz"("department");

