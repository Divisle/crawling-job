/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `ZeroNetworksJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ZeroNetworksJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "ZeroNetworksJob_location_href_key" ON "public"."ZeroNetworksJob"("location", "href");
