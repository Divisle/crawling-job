-- CreateTable
CREATE TABLE "public"."GetimpalaJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GetimpalaJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LightJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LightJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GetimpalaJob_href_key" ON "public"."GetimpalaJob"("href");

-- CreateIndex
CREATE UNIQUE INDEX "LightJob_href_key" ON "public"."LightJob"("href");
