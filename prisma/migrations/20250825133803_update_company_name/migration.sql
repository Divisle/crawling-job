/*
  Warnings:

  - Added the required column `company` to the `NumericJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."NumericJob" ADD COLUMN     "company" TEXT NOT NULL;
