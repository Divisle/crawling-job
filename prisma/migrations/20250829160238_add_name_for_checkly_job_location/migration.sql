/*
  Warnings:

  - Added the required column `locationName` to the `ChecklyLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ChecklyLocation" ADD COLUMN     "locationName" TEXT NOT NULL;
