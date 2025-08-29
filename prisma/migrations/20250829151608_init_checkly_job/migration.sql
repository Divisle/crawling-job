-- CreateTable
CREATE TABLE "public"."ChecklyJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workplaceType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklyJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChecklyLocation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "checklyJobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklyLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklyJob_jobId_key" ON "public"."ChecklyJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklyJob_href_key" ON "public"."ChecklyJob"("href");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklyLocation_locationId_key" ON "public"."ChecklyLocation"("locationId");

-- AddForeignKey
ALTER TABLE "public"."ChecklyLocation" ADD CONSTRAINT "ChecklyLocation_checklyJobId_fkey" FOREIGN KEY ("checklyJobId") REFERENCES "public"."ChecklyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
