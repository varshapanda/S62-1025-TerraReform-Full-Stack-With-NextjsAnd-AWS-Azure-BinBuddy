-- CreateTable
CREATE TABLE "UserLeaderboard" (
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeaderboard_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "UserLeaderboard_points_idx" ON "UserLeaderboard"("points");

-- AddForeignKey
ALTER TABLE "UserLeaderboard" ADD CONSTRAINT "UserLeaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
