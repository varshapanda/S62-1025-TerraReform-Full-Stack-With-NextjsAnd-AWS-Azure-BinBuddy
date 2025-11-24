"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";

interface Report {
  id: string;
  imageUrl: string;
  category: string;
  note?: string;
  lat: number;
  lng: number;
  // Address fields
  address?: string;
  houseNo?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
  reporter: {
    name?: string;
    email: string;
  };
  images: Array<{
    url: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function VerifyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchPendingReports();
  }, [pagination.page]);

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/volunteer/reports/pending?page=${pagination.page}&limit=${pagination.limit}`
      );
      const result = await response.json();

      if (result.success) {
        setReports(result.data.reports);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch pending reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedReport) return;

    if (status === "REJECTED" && !verificationNote.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/volunteer/reports/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status,
          verificationNote: verificationNote.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSelectedReport(null);
        setVerificationNote("");
        fetchPendingReports();
        router.refresh();
      } else {
        alert(result.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const getImageUrl = (report: Report) => {
    return report.images?.[0]?.url || report.imageUrl;
  };

  // Format address for display
  const getFormattedAddress = (report: Report) => {
    if (report.address) {
      return report.address;
    }

    const parts = [
      report.houseNo,
      report.street,
      report.locality,
      report.city,
      report.state,
      report.pincode,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Address not provided";
  };

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verify Reports
            </h2>
            <p className="text-slate-400">
              Review and verify pending waste reports
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/volunteer")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No pending reports to verify</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <img
                      src={getImageUrl(report)}
                      alt="Report"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">
                      {report.category}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      {report.note || "No additional notes"}
                    </p>
                    <div className="text-sm text-slate-500 mb-4">
                      <p>
                        Reported by:{" "}
                        {report.reporter.name || report.reporter.email}
                      </p>
                      <p>
                        Date:{" "}
                        {new Date(report.createdAt).toLocaleDateString("en-GB")}
                      </p>
                      <p className="flex items-start gap-1">
                        <span className="font-semibold">Location:</span>
                        <span className="flex-1">
                          {getFormattedAddress(report)}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition"
                    >
                      Review Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                Review Report
              </h3>

              <div className="mb-6">
                <img
                  src={getImageUrl(selectedReport)}
                  alt="Report"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2 text-slate-300">
                  <p>
                    <strong className="text-white">Category:</strong>{" "}
                    {selectedReport.category}
                  </p>
                  <p>
                    <strong className="text-white">Notes:</strong>{" "}
                    {selectedReport.note || "None"}
                  </p>
                  <p>
                    <strong className="text-white">Reporter:</strong>{" "}
                    {selectedReport.reporter.name ||
                      selectedReport.reporter.email}
                  </p>
                  <p className="flex items-start gap-2">
                    <strong className="text-white">Location:</strong>
                    <span className="flex-1">
                      {getFormattedAddress(selectedReport)}
                    </span>
                  </p>
                  <p>
                    <strong className="text-white">Reported:</strong>{" "}
                    {new Date(selectedReport.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-300 mb-2">
                  Verification Notes (required for rejection):
                </label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Add any notes about your verification decision..."
                  className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none placeholder-slate-500"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setVerificationNote("");
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition"
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify("REJECTED")}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition"
                  disabled={isVerifying}
                >
                  {isVerifying ? "Processing..." : "Reject"}
                </button>
                <button
                  onClick={() => handleVerify("VERIFIED")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition"
                  disabled={isVerifying}
                >
                  {isVerifying ? "Processing..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-slate-700 disabled:opacity-50 rounded text-white"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-slate-700 disabled:opacity-50 rounded text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
