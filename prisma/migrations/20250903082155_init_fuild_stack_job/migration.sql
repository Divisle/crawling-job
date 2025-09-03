-- CreateTable
CREATE TABLE "public"."FluidStackJob" (
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

    CONSTRAINT "FluidStackJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FluidStackLocation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "fluidStackJobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FluidStackLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FluidStackJob_jobId_key" ON "public"."FluidStackJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "FluidStackJob_href_key" ON "public"."FluidStackJob"("href");

-- AddForeignKey
ALTER TABLE "public"."FluidStackLocation" ADD CONSTRAINT "FluidStackLocation_fluidStackJobId_fkey" FOREIGN KEY ("fluidStackJobId") REFERENCES "public"."FluidStackJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
