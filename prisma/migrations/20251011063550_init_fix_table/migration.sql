/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `ScytaleJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ScytaleJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScytaleJob_location_href_key" ON "public"."ScytaleJob"("location", "href");
