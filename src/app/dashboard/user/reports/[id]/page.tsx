"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  Loader2,
  XCircle,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function ReportTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const {
    currentReport: report,
    reportLoading: loading,
    reportError: error,
    fetchReportById,
    resetReportError,
  } = useUserStore();

  useEffect(() => {
    if (reportId) {
      fetchReportById(reportId);
    }

    return () => {
      resetReportError();
    };
  }, [reportId, fetchReportById, resetReportError]);

  const getTrackingSteps = () => {
    if (!report) return [];

    // ✅ FIXED: Use task.status for accurate tracking
    const taskStatus = report.task?.status;

    const steps = [
      {
        title: "Report Submitted",
        description: "Your waste report has been submitted",
        date: report.createdAt,
        icon: FileText,
        completed: true,
      },
      {
        title: "Verification",
        description: "Community volunteers are verifying your report",
        date: report.verifiedAt,
        icon: CheckCircle,
        completed: report.status !== "PENDING",
      },
      {
        title: "Pickup Scheduled",
        description: "Authority has scheduled waste collection",
        date: report.task?.scheduledFor || report.scheduledAt,
        icon: Calendar,
        completed:
          taskStatus === "SCHEDULED" ||
          taskStatus === "IN_PROGRESS" ||
          taskStatus === "COMPLETED",
      },
      {
        title: "Collection in Progress",
        description: "Waste collection vehicle is on the way",
        date: report.task?.startedAt,
        icon: Truck,
        completed: taskStatus === "IN_PROGRESS" || taskStatus === "COMPLETED",
      },
      {
        title: "Collected",
        description: "Waste has been successfully collected",
        date: report.task?.completedAt || report.completedAt,
        icon: Package,
        completed: taskStatus === "COMPLETED",
      },
    ];

    return steps;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      WET: "emerald",
      DRY: "blue",
      MIXED: "amber",
      HAZARDOUS: "red",
      OTHER: "slate",
    };
    return colors[category] || "slate";
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-medium">
              Loading report details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Report Not Found
            </h2>
            <p className="text-slate-400 mb-6">
              {error || "This report does not exist"}
            </p>
            <button
              onClick={() => router.push("/dashboard/user/reports")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const trackingSteps = getTrackingSteps();
  const color = getCategoryColor(report.category);

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard/user/reports")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to All Reports</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white capitalize">
                  {report.category.toLowerCase()} Waste Report
                </h1>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    report.task?.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : report.task?.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : report.task?.status === "SCHEDULED"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : report.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : report.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {report.task?.status || report.status}
                </span>
              </div>
              <p className="text-slate-400">Report ID: {report.id}</p>
            </div>
            <div className={`p-4 bg-${color}-500/10 rounded-xl`}>
              <FileText className={`w-8 h-8 text-${color}-400`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tracking Timeline */}
          <div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-center min-h-full">
              <h2 className="text-2xl font-bold text-white mb-8">
                Tracking Status
              </h2>

              <div className="space-y-8">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === trackingSteps.length - 1;

                  return (
                    <div key={index} className="relative py-2">
                      {!isLast && (
                        <div
                          className={`absolute left-8 top-14 w-0.5 h-full ${
                            step.completed ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                        />
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`relative z-10 p-4 rounded-xl border-2 transition-all ${
                            step.completed
                              ? "bg-emerald-500/10 border-emerald-500"
                              : "bg-slate-800 border-slate-700"
                          }`}
                        >
                          <Icon
                            className={`w-7 h-7 ${
                              step.completed
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }`}
                          />
                        </div>

                        <div className="flex-1 pt-1">
                          <h3
                            className={`text-xl font-semibold mb-2 ${
                              step.completed ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-slate-400 text-base mb-2">
                            {step.description}
                          </p>
                          {step.date && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(step.date).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-6">
            {/* Image */}
            {(report.imageUrl ||
              (report.images && report.images.length > 0)) && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                  Photo Evidence
                </h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.imageUrl || report.images![0].url}
                  alt="Report"
                  className="w-full object-cover rounded-xl"
                />
              </div>
            )}

            {/* Location */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Location
              </h3>
              {report.address ? (
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {report.address}
                </p>
              ) : null}
              <p className="text-slate-500 text-xs font-mono">
                GPS: {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
              </p>
            </div>

            {/* Notes */}
            {report.note && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Additional Notes
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {report.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
