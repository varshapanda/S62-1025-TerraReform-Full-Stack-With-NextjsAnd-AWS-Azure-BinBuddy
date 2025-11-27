"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { useVolunteerStore } from "@/store/volunteerStore";

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const { stats, loading, fetchStats } = useVolunteerStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        {/* Header matching the image */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Volunteer Dashboard
          </h2>
          <p className="text-slate-400">
            Verify reports and help maintain quality
          </p>
        </div>

        {/* Stats Grid - matching the image design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">
              Pending verification
            </h3>
            <p className="text-3xl font-bold text-amber-400">
              {loading ? "..." : stats.pending}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Verified Today</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {loading ? "..." : stats.verifiedToday}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Verified</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? "..." : stats.totalVerified}
            </p>
          </div>
        </div>

        {/* Volunteer Actions - matching the image design */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Volunteer Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/dashboard/volunteer/verify")}
              className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition">
                  <span className="text-amber-400 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold mb-1">
                    Verify Reports
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Review pending reports
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push("/dashboard/volunteer/history")}
              className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition">
                  <span className="text-purple-400 font-bold">📊</span>
                </div>
                <div>
                  <h4 className="text-purple-400 font-semibold mb-1">
                    Verification History
                  </h4>
                  <p className="text-slate-400 text-sm">
                    View your verification record
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
