/*
  Warnings:

  - A unique constraint covering the columns `[href]` on the table `AnomaloJob` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AnomaloJob_href_key" ON "public"."AnomaloJob"("href");
