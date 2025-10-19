/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `AlbertinventJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."AlbertinventJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "AlbertinventJob_location_href_key" ON "public"."AlbertinventJob"("location", "href");
