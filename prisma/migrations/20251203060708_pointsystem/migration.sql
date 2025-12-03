/*
  Warnings:

  - You are about to drop the `CommunityLeaderboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLeaderboard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLeaderboard" DROP CONSTRAINT "UserLeaderboard_userId_fkey";

-- DropTable
DROP TABLE "CommunityLeaderboard";

-- DropTable
DROP TABLE "UserLeaderboard";
