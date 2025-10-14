/*
  Warnings:

  - You are about to drop the `NumericJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NumericJobTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."NumericJobTag" DROP CONSTRAINT "NumericJobTag_jobId_fkey";

-- DropTable
DROP TABLE "public"."NumericJob";

-- DropTable
DROP TABLE "public"."NumericJobTag";
