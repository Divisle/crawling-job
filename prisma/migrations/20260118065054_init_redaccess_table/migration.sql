/*
  Warnings:

  - You are about to drop the `redaccessJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."redaccessJob";

-- CreateTable
CREATE TABLE "public"."RedaccessJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedaccessJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedaccessJob_href_key" ON "public"."RedaccessJob"("href");
