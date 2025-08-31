-- CreateTable
CREATE TABLE "public"."TeleportJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeleportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeleportJob_href_key" ON "public"."TeleportJob"("href");
