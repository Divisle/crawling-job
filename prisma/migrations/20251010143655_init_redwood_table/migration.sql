-- CreateTable
CREATE TABLE "public"."RedwoodJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedwoodJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedwoodJob_href_key" ON "public"."RedwoodJob"("href");
