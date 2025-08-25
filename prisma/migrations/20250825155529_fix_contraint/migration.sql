/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `NumericJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."NumericJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "NumericJob_title_key" ON "public"."NumericJob"("title");
