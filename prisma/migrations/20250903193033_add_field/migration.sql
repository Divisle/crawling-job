/*
  Warnings:

  - Added the required column `department` to the `HightouchJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HightouchJob" ADD COLUMN     "department" TEXT NOT NULL;
