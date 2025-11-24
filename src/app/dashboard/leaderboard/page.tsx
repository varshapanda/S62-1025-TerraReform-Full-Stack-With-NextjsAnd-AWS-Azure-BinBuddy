"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [userTotalReports, setUserTotalReports] = useState(0);
  const [userValidatedReports, setUserValidatedReports] = useState(0);
  const [topCommunity, setTopCommunity] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const top10Communities = [
    { rank: 1, name: "Green Valley", impactScore: 8542 },
    { rank: 2, name: "Eco Warriors District", impactScore: 7823 },
    { rank: 3, name: "Clean Streets Alliance", impactScore: 6901 },
    { rank: 4, name: "Sustainability Hub", impactScore: 6234 },
    { rank: 5, name: "Zero Waste Community", impactScore: 5876 },
    { rank: 6, name: "Earth Guardians", impactScore: 5432 },
    { rank: 7, name: "Coastal Clean Up", impactScore: 4987 },
    { rank: 8, name: "Urban Green Initiative", impactScore: 4521 },
    { rank: 9, name: "Recycle Champions", impactScore: 4102 },
    { rank: 10, name: "Environment First", impactScore: 3845 },
  ];

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setUserPoints(data.userPoints || 0);
        setUserRank(data.userRank || 0);
        setUserTotalReports(data.userTotalReports || 0);
        setUserValidatedReports(data.userValidatedReports || 0);
        setTopCommunity(data.topCommunity || null);
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1)
      return "bg-emerald-400/20 text-emerald-400 border-emerald-400/30";
    if (rank === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/30";
    if (rank === 3) return "bg-amber-400/20 text-amber-400 border-amber-400/30";
    return "bg-slate-700/50 text-slate-400 border-slate-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
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
          <div className="lg:w-1/4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
              <div className="text-center pb-6 border-b border-slate-700">
                <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-10 h-10 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-2">
                  Your Impact
                </h3>
                <p className="text-4xl font-bold text-white mb-1">
                  {userPoints}
                </p>
                <p className="text-emerald-400 text-sm">points</p>
              </div>

              <div className="flex-1 flex flex-col justify-evenly pt-6 space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">Global Rank</p>
                  <p className="text-2xl font-bold text-white">#{userRank}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-white">
                    {userTotalReports}
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">
                    Validated Reports
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {userValidatedReports}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Top Community
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Leading community by total impact
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-400/20 border border-emerald-400/30 rounded-lg">
                    <span className="text-emerald-400 font-bold text-sm">
                      #1 Ranked
                    </span>
                  </div>
                </div>

                {topCommunity ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {topCommunity.name}
                      </h3>
                      <p className="text-slate-400">
                        Most reports submitted with highest validation rate
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-slate-400 text-xs">
                            Validated Reports
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {topCommunity.validatedCount || 0}
                        </p>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-slate-400 text-xs">
                            Total Reports
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {topCommunity.totalReports || 0}
                        </p>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="text-slate-400 text-xs">Contributors</p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {topCommunity.userCount || 0}
                        </p>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <p className="text-slate-400 text-xs">Volunteers</p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {topCommunity.volunteerCount || 0}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No community data available
                  </p>
                )}
              </div>

              <div className="border-t border-slate-700">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-bold text-white">
                    Top 10 Communities
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Communities ranked by total impact score
                  </p>
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full">
                    <thead className="bg-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Community
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Impact Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10Communities.map((community) => (
                        <tr
                          key={community.rank}
                          className="border-t border-slate-700 hover:bg-slate-700/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-sm ${getRankBadge(
                                community.rank
                              )}`}
                            >
                              {community.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">
                              {community.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-emerald-400 font-semibold text-lg">
                              {community.impactScore.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Top Contributors</h2>
            <p className="text-slate-400 text-sm mt-1">
              Users making the biggest impact
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Verified Reports
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => (
                      <tr
                        key={user.id || index}
                        className="border-t border-slate-700 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-sm ${getRankBadge(
                              index + 1
                            )}`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-semibold">
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {user.name || "Anonymous"}
                              </div>
                              {user.email && (
                                <div className="text-slate-400 text-sm">
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-emerald-400 font-semibold text-lg">
                            {user.points?.toLocaleString() || 0}
                          </span>
                          <span className="text-slate-400 text-sm ml-1">
                            pts
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-white font-medium">
                            {user.garbageCollected || 0}
                          </span>
                          <span className="text-slate-400 text-sm ml-1">
                            reports
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No leaderboard data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
