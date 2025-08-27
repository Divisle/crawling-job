/*
  Warnings:

  - A unique constraint covering the columns `[href]` on the table `PivotalJob` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PivotalJob_href_key" ON "public"."PivotalJob"("href");
