-- DropForeignKey
ALTER TABLE "public"."NumericJobTag" DROP CONSTRAINT "NumericJobTag_jobId_fkey";

-- AddForeignKey
ALTER TABLE "public"."NumericJobTag" ADD CONSTRAINT "NumericJobTag_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."NumericJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
