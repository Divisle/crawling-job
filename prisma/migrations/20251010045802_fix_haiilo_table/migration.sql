/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `HaiiloJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."HaiiloJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "HaiiloJob_location_href_key" ON "public"."HaiiloJob"("location", "href");
