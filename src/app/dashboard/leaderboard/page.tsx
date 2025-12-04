"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);

  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [userTotalReports, setUserTotalReports] = useState(0);
  const [userValidatedReports, setUserValidatedReports] = useState(0);

  type CityCommunity = {
    name: string;
    locality: string; // Added locality field
    impactScore: number;
    validatedCount: number;
    totalReports: number;
    userCount: number;
  };

  type LeaderboardUser = {
    id: string;
    name: string | null;
    points: number;
    locality?: string; // Added optional locality field for users
  };

  const [topCityCommunity, setTopCityCommunity] =
    useState<CityCommunity | null>(null);

  const [topCityCommunities, setTopCityCommunities] = useState<CityCommunity[]>(
    []
  );

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  const [communityScrollPosition, setCommunityScrollPosition] = useState(0);

  async function loadData() {
    try {
      const res = await fetch("/api/leaderboard", {
        cache: "no-store",
      });

      const data = await res.json();

      setUserPoints(data.userPoints || 0);
      setUserRank(data.userRank || 0);
      setUserTotalReports(data.userTotalReports || 0);
      setUserValidatedReports(data.userValidatedReports || 0);

      setTopCityCommunity(data.topCommunity || null);
      setTopCityCommunities(data.topCommunities || []);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 3000);
    return () => clearInterval(timer);
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-emerald-400/20 text-emerald-400 border-emerald-400/30";
    if (rank === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/30";
    if (rank === 3) return "bg-amber-400/20 text-amber-400 border-amber-400/30";
    return "bg-slate-700/50 text-slate-400 border-slate-600";
  };

  const scrollCommunities = (direction: "left" | "right") => {
    const container = document.getElementById("communities-scroll");
    if (container) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? Math.max(0, communityScrollPosition - scrollAmount)
          : communityScrollPosition + scrollAmount;

      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setCommunityScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      {/* SCROLLBAR STYLE */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #34d399;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #34d399 #0f172a;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400 mt-1">
            Track your impact and see top contributors
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* USER STATS */}
          <div className="lg:w-1/4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
              <h3 className="text-slate-400 mb-4 text-center">Your Impact</h3>

              <div className="text-center mb-6 flex-grow flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-white mb-2">
                  {userPoints}
                </p>
                <p className="text-emerald-400 text-lg">Points</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-xs text-slate-400">Global Rank</p>
                  <p className="text-2xl text-white">#{userRank}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-xs text-slate-400">Total Reports</p>
                  <p className="text-2xl text-white">{userTotalReports}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-xs text-slate-400">Validated Reports</p>
                  <p className="text-2xl text-emerald-400">
                    {userValidatedReports}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TOP CITY / COMMUNITY + LIST */}
          <div className="lg:w-3/4 space-y-6">
            {topCityCommunity && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl text-white mb-2">
                  Top City / Community in India
                </h2>

                <p className="text-3xl text-emerald-400">
                  {topCityCommunity.name}
                </p>
                {topCityCommunity.locality && (
                  <p className="text-slate-300 mt-1">
                    Locality: {topCityCommunity.locality}
                  </p>
                )}

                <div className="flex gap-6 mt-4">
                  <div>
                    <p className="text-slate-400">Validated</p>
                    <p className="text-white">
                      {topCityCommunity.validatedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Reports</p>
                    <p className="text-white">
                      {topCityCommunity.totalReports}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Users</p>
                    <p className="text-white">{topCityCommunity.userCount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-semibold">
                  Top Indian Cities & Communities
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => scrollCommunities("left")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-emerald-400/50 rounded-lg transition-all"
                    aria-label="Scroll left"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCommunities("right")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-emerald-400/50 rounded-lg transition-all"
                    aria-label="Scroll right"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {topCityCommunities.length === 0 ? (
                <p className="p-6 text-slate-500 text-center">
                  No Indian city/community data available
                </p>
              ) : (
                <div
                  id="communities-scroll"
                  className="max-h-[300px] overflow-y-auto custom-scrollbar"
                  onScroll={(e) =>
                    setCommunityScrollPosition(e.currentTarget.scrollLeft)
                  }
                >
                  <table className="w-full">
                    <thead className="bg-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-emerald-400">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-emerald-400">
                          City / Community
                        </th>
                        <th className="px-6 py-3 text-left text-emerald-400">
                          Locality
                        </th>
                        <th className="px-6 py-3 text-right text-emerald-400">
                          Impact
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {topCityCommunities.map((c, i) => (
                        <tr
                          key={c.name}
                          className="border-t border-slate-700 hover:bg-slate-700/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 border rounded ${getRankBadge(
                                i + 1
                              )}`}
                            >
                              {i + 1}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-white">{c.name}</td>

                          <td className="px-6 py-4 text-slate-300">
                            {c.locality || "N/A"}
                          </td>

                          <td className="px-6 py-4 text-right text-emerald-400">
                            {c.impactScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP CONTRIBUTORS */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Top Contributors</h2>
            <p className="text-slate-400 text-sm mt-1">
              Users making the biggest impact
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <p className="p-6 text-slate-500 text-center">
              No leaderboard data yet
            </p>
          ) : (
            <>
              <div className="px-6 pb-6 pt-4">
                <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div
                      key={user.id || index}
                      className="flex-shrink-0 w-48 bg-slate-700/30 rounded-xl p-4 border border-slate-600 hover:border-emerald-400/50 transition-colors"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-sm ${getRankBadge(
                            index + 1
                          )}`}
                        >
                          {index + 1}
                        </span>

                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold text-2xl">
                          {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>

                        <div className="w-full">
                          <div className="text-white font-medium truncate">
                            {user.name || "Anonymous"}
                          </div>
                          {user.locality && (
                            <div className="text-slate-400 text-xs truncate mt-1">
                              {user.locality}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-600 w-full">
                          <div className="text-emerald-400 font-bold text-xl">
                            {user.points?.toLocaleString() || 0}
                          </div>
                          <div className="text-slate-400 text-xs">points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-700">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-emerald-400">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-emerald-400">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-emerald-400">
                        Locality
                      </th>
                      <th className="px-6 py-3 text-right text-emerald-400">
                        Points
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaderboard.map((u, i) => (
                      <tr
                        key={u.id || i}
                        className="border-t border-slate-700 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 border rounded ${getRankBadge(
                              i + 1
                            )}`}
                          >
                            {i + 1}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-white">
                          {u.name || "Anonymous"}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {u.locality || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-right text-emerald-400">
                          {u.points} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
