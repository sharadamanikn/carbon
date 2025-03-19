/*
  Warnings:

  - A unique constraint covering the columns `[libraryMembershipId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `seniority` on the `Professor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "seniority",
ADD COLUMN     "seniority" "Seniority" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "libraryMembershipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_libraryMembershipId_key" ON "Student"("libraryMembershipId");
