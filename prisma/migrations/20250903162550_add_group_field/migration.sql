/*
  Warnings:

  - Added the required column `group` to the `SysdigJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SysdigJob" ADD COLUMN     "group" TEXT NOT NULL;
