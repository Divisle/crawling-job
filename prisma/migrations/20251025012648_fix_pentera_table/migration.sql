/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `PenteraJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PenteraJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "PenteraJob_location_href_key" ON "public"."PenteraJob"("location", "href");
