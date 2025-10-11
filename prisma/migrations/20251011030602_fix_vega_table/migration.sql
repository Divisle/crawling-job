/*
  Warnings:

  - You are about to drop the `VegasJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."VegasJob";

-- CreateTable
CREATE TABLE "public"."VegaJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VegaJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VegaJob_href_key" ON "public"."VegaJob"("href");
