/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `DatavisorJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."DatavisorJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "DatavisorJob_location_href_key" ON "public"."DatavisorJob"("location", "href");
