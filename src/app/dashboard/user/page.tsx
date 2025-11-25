"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { CheckCircle, X, Shield, Clock, Users } from "lucide-react";

interface Report {
  id: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function UserDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /**
   * Handles volunteer request submission
   */
  const handleVolunteerSubmit = async () => {
    setVolunteerLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/volunteer-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
      // Auto-close after 5 seconds
      setTimeout(() => {
        setShowVolunteerModal(false);
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting volunteer request:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setVolunteerLoading(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Volunteer Button at Top */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowVolunteerModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Become a Volunteer
          </button>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/user/report"
            className="p-6 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left transition group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 text-lg">📸</span>
              </div>
              <h4 className="text-emerald-400 font-semibold text-lg">
                Report Waste
              </h4>
            </div>
            <p className="text-slate-400 text-sm">
              Submit a new waste report with photos and location details
            </p>
          </Link>

          <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-400 text-lg">👥</span>
              </div>
              <h4 className="text-purple-400 font-semibold text-lg">
                Community Impact
              </h4>
            </div>
            <p className="text-slate-400 text-sm">
              View your contributions and impact on the community
            </p>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Reports
          </h3>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-slate-400">
              No reports yet. Start by submitting your first waste report!
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg flex justify-between items-center hover:bg-slate-700/70 transition"
                >
                  <div>
                    <p className="text-white font-medium capitalize">
                      {report.category.toLowerCase()}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === "VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : report.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
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

      {/* Volunteer Request Modal */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                  Become a Volunteer
                </h3>
                <p className="text-slate-300">
                  Help build a cleaner future for your community
                </p>
              </div>

              <button
                onClick={() => {
                  setShowVolunteerModal(false);
                  setSubmitted(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            {!submitted ? (
              <div className="p-6 space-y-6">
                {/* Role Overview Card */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-xl p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="text-emerald-400" size={24} />
                    Your Role as a Volunteer
                  </h4>
                  <p className="text-slate-300 mb-4">
                    As a volunteer verifier, you will play a crucial role in
                    maintaining the integrity of our waste management system.
                  </p>
                </div>

                {/* Key Responsibilities Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-emerald-400">
                    Key Responsibilities:
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-emerald-500/20 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1 text-white">
                          Review Waste Reports
                        </h5>
                        <p className="text-slate-300 text-sm">
                          Examine photos submitted by residents to verify proper
                          waste segregation into recyclable, organic, and
                          non-recyclable categories.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-emerald-500/20 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <Shield className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1 text-white">
                          Verify Authenticity
                        </h5>
                        <p className="text-slate-300 text-sm">
                          Check for originality and accuracy. Ensure reports are
                          genuine and waste is properly categorized according to
                          guidelines.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-emerald-500/20 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <Users className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1 text-white">
                          Approve or Reject
                        </h5>
                        <p className="text-slate-300 text-sm">
                          Make fair decisions to approve valid reports or reject
                          those that do not meet standards, with constructive
                          feedback.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-emerald-500/20 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1 text-white">
                          Time Commitment
                        </h5>
                        <p className="text-slate-300 text-sm">
                          Flexible! Review reports at your convenience. Most
                          volunteers spend 2-5 hours per week, but you can do
                          more or less.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">
                    Requirements:
                  </h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>Commitment to environmental sustainability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>
                        Basic knowledge of waste segregation categories
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>Fair and unbiased decision-making</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>Reliable internet access</span>
                    </li>
                  </ul>
                </div>

                {/* Error Message Display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleVolunteerSubmit}
                  disabled={volunteerLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {volunteerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Apply to Volunteer</>
                  )}
                </button>

                {/* Disclaimer Text */}
                <p className="text-xs text-slate-400 text-center">
                  Your request will be reviewed by our admin team. You will
                  receive a confirmation email once approved.
                </p>
              </div>
            ) : (
              // Success State - After submission
              <div className="p-8 text-center relative">
                {/* Close button for success message */}
                <button
                  onClick={() => {
                    setShowVolunteerModal(false);
                    setSubmitted(false);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-700"
                >
                  <X size={20} />
                </button>

                {/* Success Icon */}
                <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-emerald-400" size={40} />
                </div>

                {/* Success Message */}
                <h4 className="text-2xl font-bold mb-3 text-emerald-400">
                  Request Submitted!
                </h4>
                <p className="text-slate-300 mb-4">
                  Thank you for wanting to make a difference! Our admin team
                  will review your volunteer request and get back to you
                  shortly.
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  You will receive an email confirmation once your account is
                  approved.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
