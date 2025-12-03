// src/app/dashboard/admin/page.tsx
"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import Link from "next/link";
import { Users, FileText, CheckSquare, Heart, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

export default function AdminDashboardPage() {
  const { stats, loading, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-400" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Admin Dashboard
          </h2>
          <p className="text-slate-400">Manage the entire BinBuddy system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.roleBreakdown?.volunteer || 0} volunteers
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.totalReports || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              +{stats?.reportsToday || 0} today
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Active Tasks</h3>
            <p className="text-3xl font-bold text-amber-400">
              {stats?.activeTasks || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.pendingVolunteerRequests || 0} pending requests
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">System Health</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {stats?.systemHealth || 100}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.recentReports || 0} reports last 7 days
            </p>
          </div>
        </div>

        {/* Role Breakdown Card */}
        {stats?.roleBreakdown && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              User Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{count}</p>
                  <p className="text-sm text-slate-400 capitalize">{role}s</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/admin/users"
              className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-left transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-purple-400" size={24} />
                <h4 className="text-purple-400 font-semibold">Manage Users</h4>
              </div>
              <p className="text-slate-400 text-sm">
                View and manage all users
              </p>
            </Link>

            <Link
              href="/dashboard/admin/volunteer-requests"
              className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-left transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-emerald-400" size={24} />
                <h4 className="text-emerald-400 font-semibold">
                  Volunteer Requests
                </h4>
              </div>
              <p className="text-slate-400 text-sm">
                Review volunteer applications
              </p>
              {stats?.pendingVolunteerRequests ? (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {stats.pendingVolunteerRequests} pending
                </span>
              ) : null}
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-left transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-red-400" size={24} />
                <h4 className="text-red-400 font-semibold">View Reports</h4>
              </div>
              <p className="text-slate-400 text-sm">
                Monitor all system reports
              </p>
            </Link>

            <button className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-left transition">
              <div className="flex items-center gap-3 mb-2">
                <CheckSquare className="text-amber-400" size={24} />
                <h4 className="text-amber-400 font-semibold">
                  System Settings
                </h4>
              </div>
              <p className="text-slate-400 text-sm">
                Configure system parameters
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
