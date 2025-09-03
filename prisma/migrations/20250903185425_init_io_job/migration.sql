-- CreateTable
CREATE TABLE "public"."IoJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IoJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IoJob_jobId_key" ON "public"."IoJob"("jobId");
