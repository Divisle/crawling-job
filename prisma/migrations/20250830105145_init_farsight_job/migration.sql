-- CreateTable
CREATE TABLE "public"."FarSightJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarSightJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarSightLocation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "farSightJobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarSightLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FarSightJob_jobId_key" ON "public"."FarSightJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "FarSightJob_href_key" ON "public"."FarSightJob"("href");

-- AddForeignKey
ALTER TABLE "public"."FarSightLocation" ADD CONSTRAINT "FarSightLocation_farSightJobId_fkey" FOREIGN KEY ("farSightJobId") REFERENCES "public"."FarSightJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
