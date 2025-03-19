/*
  Warnings:

  - You are about to drop the column `libraryMembershipId` on the `Student` table. All the data in the column will be lost.
  - Changed the type of `seniority` on the `Professor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Student_proctorId_key";

-- AlterTable
ALTER TABLE "Professor" ALTER COLUMN "seniority" TYPE TEXT USING seniority::TEXT;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "libraryMembershipId";
