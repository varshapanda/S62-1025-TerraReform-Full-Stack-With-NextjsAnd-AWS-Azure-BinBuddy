-- CreateTable
CREATE TABLE "UserLeaderboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityLeaderboard" (
    "id" TEXT NOT NULL,
    "communityName" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "verifiedContributions" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLeaderboard_userId_key" ON "UserLeaderboard"("userId");

-- CreateIndex
CREATE INDEX "UserLeaderboard_rank_idx" ON "UserLeaderboard"("rank");

-- CreateIndex
CREATE INDEX "CommunityLeaderboard_rank_idx" ON "CommunityLeaderboard"("rank");

-- AddForeignKey
ALTER TABLE "UserLeaderboard" ADD CONSTRAINT "UserLeaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
