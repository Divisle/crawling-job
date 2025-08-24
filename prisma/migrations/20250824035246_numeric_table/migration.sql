-- CreateTable
CREATE TABLE "public"."NumericJob" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location_type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumericJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NumericJobTag" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumericJobTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NumericJob_href_key" ON "public"."NumericJob"("href");

-- CreateIndex
CREATE UNIQUE INDEX "NumericJobTag_tag_key" ON "public"."NumericJobTag"("tag");

-- AddForeignKey
ALTER TABLE "public"."NumericJobTag" ADD CONSTRAINT "NumericJobTag_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."NumericJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
