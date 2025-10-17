/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `TatumJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."TatumJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "TatumJob_location_href_key" ON "public"."TatumJob"("location", "href");
