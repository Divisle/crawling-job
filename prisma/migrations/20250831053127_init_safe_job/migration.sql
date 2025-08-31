-- CreateTable
CREATE TABLE "public"."SafeJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "bigDepartment" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "workplaceType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafeJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SafeJob_href_key" ON "public"."SafeJob"("href");
