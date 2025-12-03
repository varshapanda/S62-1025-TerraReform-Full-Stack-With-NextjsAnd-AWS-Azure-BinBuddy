// src/app/dashboard/admin/reports/page.tsx
"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import MessageToast from "@/components/dashboard/admin/messageToast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  MapPin,
  Calendar,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import Image from "next/image";

type FilterType = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

export default function AdminReportsPage() {
  const {
    reports,
    loading,
    reportFilterStatus,
    fetchReports,
    setReportFilterStatus,
    deleteReport,
  } = useAdminStore();

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <Clock size={12} />
            Pending
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle size={12} />
            Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }
    await deleteReport(reportId);
  };

  return (
    <DashboardLayout role="admin">
      <MessageToast />
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/dashboard/admin"
            className="hover:text-emerald-400 transition"
          >
            Dashboard
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">Reports</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Reports</h2>
          <p className="text-slate-400">Monitor all waste reports</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as FilterType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setReportFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  reportFilterStatus === tab
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-400" size={40} />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <p className="text-slate-400">
              No {reportFilterStatus.toLowerCase()} reports found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {report.category}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-slate-400 text-sm">
                      Reported by: {report.reporter.name}
                    </p>
                  </div>
                  {report.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden ml-4">
                      <Image
                        src={report.imageUrl}
                        alt="Report"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />
                    <span>
                      {report.address || `${report.city}, ${report.state}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    <span>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {report.note && (
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {report.note}
                  </p>
                )}

                {report.verifications && report.verifications.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">
                      Verifications: {report.verifications.length}
                    </p>
                    {report.verifications.map((v) => (
                      <p key={v.id} className="text-xs text-slate-300">
                        {v.volunteer.name} - {v.decision}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/admin/reports/${report.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
