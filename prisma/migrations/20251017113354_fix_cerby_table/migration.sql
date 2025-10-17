/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `CerbyJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."CerbyJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "CerbyJob_location_href_key" ON "public"."CerbyJob"("location", "href");
