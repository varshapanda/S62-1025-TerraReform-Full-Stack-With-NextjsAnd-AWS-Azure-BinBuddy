/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_city_idx";

-- DropIndex
DROP INDEX "User_state_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "country";
