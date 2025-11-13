"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboardLayout";

interface Report {
  id: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function UserDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports/my-reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: reports.length,
    verified: reports.filter((r) => r.status === "VERIFIED").length,
    pending: reports.filter((r) => r.status === "PENDING").length,
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Dashboard</h2>
          <p className="text-slate-400">
            Report waste and track your contributions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Verified Reports</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {stats.verified}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Pending Reports</h3>
            <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <Link
            href="/dashboard/user/report"
            className="inline-block p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-left transition"
          >
            <h4 className="text-emerald-400 font-semibold mb-1">
              📸 Report Waste
            </h4>
            <p className="text-slate-400 text-sm">Submit a new waste report</p>
          </Link>
        </div>

        {/* Recent Reports */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Reports
          </h3>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-slate-400">No reports yet</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium">{report.category}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === "VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
