/*
  Warnings:

  - A unique constraint covering the columns `[location,href]` on the table `EnterpretJob` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[location,href]` on the table `ResolveJob` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."EnterpretJob_href_key";

-- DropIndex
DROP INDEX "public"."ResolveJob_href_key";

-- CreateIndex
CREATE UNIQUE INDEX "EnterpretJob_location_href_key" ON "public"."EnterpretJob"("location", "href");

-- CreateIndex
CREATE UNIQUE INDEX "ResolveJob_location_href_key" ON "public"."ResolveJob"("location", "href");
