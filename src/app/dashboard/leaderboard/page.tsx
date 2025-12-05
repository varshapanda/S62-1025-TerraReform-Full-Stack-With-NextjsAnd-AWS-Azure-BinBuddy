"use client";

import { useEffect, useState } from "react";
import { useLeaderboardStore } from "@/store/leaderboardStore";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import {
  Trophy,
  Medal,
  Award,
  Users,
  MapPin,
  TrendingUp,
  Loader2,
  Crown,
  Target,
  CheckCircle,
} from "lucide-react";

export default function LeaderboardPage() {
  const {
    topUsers,
    topVolunteers,
    topCommunities,
    currentUserRank,
    timeRange,
    selectedCity,
    loading,
    setTimeRange,
    setSelectedCity,
    refreshAllLeaderboards,
  } = useLeaderboardStore();

  const [activeTab, setActiveTab] = useState<
    "users" | "volunteers" | "communities"
  >("users");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    refreshAllLeaderboards();
  }, [refreshAllLeaderboards]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/leaderboard/cities");
        if (response.ok) {
          const data = await response.json();
          setAvailableCities(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1)
      return "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    if (rank === 2)
      return "from-slate-400/20 to-slate-500/10 border-slate-400/30";
    if (rank === 3)
      return "from-amber-500/20 to-amber-600/10 border-amber-500/30";
    return "from-slate-700/30 to-slate-800/30 border-slate-600/30";
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-10 h-10 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
              <p className="text-emerald-100">
                Celebrating our top contributors and communities
              </p>
            </div>
          </div>

          {/* Current User Rank Card */}
          {currentUserRank && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Your Rank</p>
                    <p className="text-white text-2xl font-bold">
                      #{currentUserRank.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Your Points</p>
                  <p className="text-white text-2xl font-bold">
                    {currentUserRank.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Range */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                Time Range
              </label>
              <div className="flex gap-2">
                {(["all", "month", "week"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      timeRange === range
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {range === "all"
                      ? "All Time"
                      : range === "month"
                        ? "This Month"
                        : "This Week"}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter (for communities) */}
            {activeTab === "communities" && (
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Filter by City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                >
                  <option value="ALL">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "users"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <Users className="w-5 h-5" />
            Top Residents
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "volunteers"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Top Volunteers
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "communities"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <MapPin className="w-5 h-5" />
            Top Communities
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Users Leaderboard */}
        {!loading && activeTab === "users" && (
          <div className="space-y-3">
            {topUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No users found for this time range
              </div>
            ) : (
              topUsers.map((user) => (
                <div
                  key={user.id}
                  className={`bg-gradient-to-r ${getRankBgColor(user.rank)} border rounded-xl p-6 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          {user.locality && user.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {user.locality}, {user.city}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>{user.verifiedReports} verified reports</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-2xl font-bold">
                          {user.points.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">points</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Volunteers Leaderboard */}
        {!loading && activeTab === "volunteers" && (
          <div className="space-y-3">
            {topVolunteers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No volunteers found for this time range
              </div>
            ) : (
              topVolunteers.map((volunteer) => (
                <div
                  key={volunteer.id}
                  className={`bg-gradient-to-r ${getRankBgColor(volunteer.rank)} border rounded-xl p-6 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(volunteer.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {volunteer.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          {volunteer.locality && volunteer.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {volunteer.locality}, {volunteer.city}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              {volunteer.verificationsCount} verifications
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-2xl font-bold">
                          {volunteer.points.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">points</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Communities Leaderboard */}
        {!loading && activeTab === "communities" && (
          <div className="space-y-3">
            {topCommunities.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No communities found for this time range
              </div>
            ) : (
              topCommunities.map((community) => (
                <div
                  key={`${community.locality}-${community.city}`}
                  className={`bg-gradient-to-r ${getRankBgColor(community.rank)} border rounded-xl p-6 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(community.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {community.locality}
                        </h3>
                        <p className="text-slate-400">{community.city}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{community.activeUsers} active users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              {community.verifiedReports} verified reports
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-2xl font-bold">
                          {community.totalPoints.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">community points</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
