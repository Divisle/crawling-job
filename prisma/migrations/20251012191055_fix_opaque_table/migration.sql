/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `OpaqueJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."OpaqueJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "OpaqueJob_location_href_key" ON "public"."OpaqueJob"("location", "href");
