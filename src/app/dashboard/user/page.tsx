"use client";

import { useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import {
  CheckCircle,
  X,
  Shield,
  Clock,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function UserDashboardPage() {
  const {
    reports,
    stats,
    loading,
    showVolunteerModal,
    volunteerSubmitted,
    volunteerLoading,
    volunteerError,
    fetchReports,
    setShowVolunteerModal,
    submitVolunteerRequest,
    resetVolunteerState,
  } = useUserStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-slate-400 text-lg">
              Track your environmental impact and contributions
            </p>
          </div>
          <button
            onClick={() => setShowVolunteerModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105"
          >
            <Users className="w-5 h-5" />
            <span>Join as Volunteer</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  All Time
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Total Reports
              </h3>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-600/50 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-400">
                  +
                  {stats.verified > 0
                    ? Math.round((stats.verified / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Verified Reports
              </h3>
              <p className="text-4xl font-bold text-white">{stats.verified}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-600/50 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  In Review
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Pending Reports
              </h3>
              <p className="text-4xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/user/report"
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-8 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
              <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-2">
                Report Waste
              </h4>
              <p className="text-emerald-100 text-base leading-relaxed">
                Submit a new waste report with photos and location details to
                help your community
              </p>
              <div className="mt-6 inline-flex items-center text-white font-semibold">
                <span>Get Started</span>
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
              <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-2">
                Community Impact
              </h4>
              <p className="text-purple-100 text-base leading-relaxed">
                View your contributions and the positive impact you&apos;re
                making in your neighborhood
              </p>
              <div className="mt-6 inline-flex items-center text-white font-semibold opacity-60">
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
            {reports.length > 0 && (
              <span className="text-sm text-slate-400 font-medium">
                {reports.length} total reports
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-slate-700/30 rounded-2xl mb-4">
                <AlertCircle className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">No reports yet</p>
              <p className="text-slate-500 text-sm mb-6">
                Start by submitting your first waste report
              </p>
              <Link
                href="/dashboard/user/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Create First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const color = getCategoryColor(report.category);
                return (
                  <div
                    key={report.id}
                    className="group bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-${color}-500/10 rounded-lg`}>
                          <FileText className={`w-5 h-5 text-${color}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg capitalize">
                            {report.category.toLowerCase()} Waste
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <p className="text-slate-400 text-sm">
                              {new Date(report.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                          report.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : report.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Modal */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Volunteer Program
                </h3>
                <p className="text-slate-400">
                  Join us in building a sustainable future
                </p>
              </div>
              <button
                onClick={() => setShowVolunteerModal(false)}
                className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>

            {!volunteerSubmitted ? (
              <div className="p-8 space-y-8">
                {/* Overview */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Shield className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        Your Role as Volunteer
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        Help maintain the integrity of our waste management
                        system by verifying community reports and ensuring
                        accurate data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-6">
                    Key Responsibilities
                  </h4>
                  <div className="grid gap-4">
                    {[
                      {
                        icon: CheckCircle,
                        title: "Review Waste Reports",
                        description:
                          "Examine submitted photos and verify proper waste segregation into appropriate categories.",
                      },
                      {
                        icon: Shield,
                        title: "Verify Authenticity",
                        description:
                          "Ensure reports are genuine and waste is correctly categorized according to guidelines.",
                      },
                      {
                        icon: Users,
                        title: "Community Decisions",
                        description:
                          "Make fair decisions to approve valid reports with constructive feedback when needed.",
                      },
                      {
                        icon: Clock,
                        title: "Flexible Commitment",
                        description:
                          "Review at your convenience. Most volunteers contribute 2-5 hours per week.",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex-shrink-0 p-3 bg-emerald-500/10 rounded-xl h-fit">
                          <item.icon className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white mb-1 text-base">
                            {item.title}
                          </h5>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Requirements
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Commitment to environmental sustainability",
                      "Basic knowledge of waste segregation",
                      "Fair and unbiased decision-making",
                      "Reliable internet access",
                    ].map((req, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-slate-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {volunteerError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{volunteerError}</p>
                  </div>
                )}

                <button
                  onClick={submitVolunteerRequest}
                  disabled={volunteerLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {volunteerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      <span>Apply to Volunteer</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Your application will be reviewed by our admin team.
                  You&apos;ll receive confirmation via email once approved.
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl mb-6">
                  <CheckCircle className="text-emerald-400 w-16 h-16" />
                </div>
                <h4 className="text-3xl font-bold text-white mb-4">
                  Application Submitted!
                </h4>
                <p className="text-slate-300 text-lg mb-2 max-w-md mx-auto">
                  Thank you for stepping forward to make a difference in your
                  community.
                </p>
                <p className="text-slate-400 mb-8">
                  Our admin team will review your request and contact you
                  shortly via email.
                </p>
                <button
                  onClick={() => setShowVolunteerModal(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
