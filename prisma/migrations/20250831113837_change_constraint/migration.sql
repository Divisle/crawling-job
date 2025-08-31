/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `LegionJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."LegionJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "LegionJob_title_key" ON "public"."LegionJob"("title");
