/*
  Warnings:

  - You are about to drop the column `bigDepartment` on the `SafeJob` table. All the data in the column will be lost.
  - Added the required column `group` to the `SafeJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SafeJob" DROP COLUMN "bigDepartment",
ADD COLUMN     "group" TEXT NOT NULL;
