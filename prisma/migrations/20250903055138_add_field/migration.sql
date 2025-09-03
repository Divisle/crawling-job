/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `LumosJob` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `LumosJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."LumosJob_href_key";

-- AlterTable
ALTER TABLE "public"."LumosJob" ADD COLUMN     "jobId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LumosJob_jobId_key" ON "public"."LumosJob"("jobId");
