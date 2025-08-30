-- CreateTable
CREATE TABLE "public"."VoizeJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workplaceType" TEXT,
    "employmentType" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoizeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoizeLocation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "voizeJobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoizeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoizeJob_jobId_key" ON "public"."VoizeJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "VoizeJob_href_key" ON "public"."VoizeJob"("href");

-- AddForeignKey
ALTER TABLE "public"."VoizeLocation" ADD CONSTRAINT "VoizeLocation_voizeJobId_fkey" FOREIGN KEY ("voizeJobId") REFERENCES "public"."VoizeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
