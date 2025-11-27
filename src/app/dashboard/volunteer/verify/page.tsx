"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { useVolunteerStore } from "@/store/volunteerStore";

export default function VerifyReportsPage() {
  const router = useRouter();
  const {
    pendingReports,
    loading,
    pendingPagination,
    selectedReport,
    verificationNote,
    isVerifying,
    fetchPendingReports,
    setSelectedReport,
    setVerificationNote,
    verifyReport,
    resetVerificationState,
  } = useVolunteerStore();

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const handleVerify = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedReport) return;

    if (status === "REJECTED" && !verificationNote.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    const success = await verifyReport(
      selectedReport.id,
      status,
      verificationNote
    );

    if (!success) {
      alert("Verification failed");
    }
  };

  const getImageUrl = (report: (typeof pendingReports)[0]) => {
    return report.images?.[0]?.url || report.imageUrl;
  };

  const getFormattedAddress = (report: (typeof pendingReports)[0]) => {
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

  const handlePageChange = (newPage: number) => {
    fetchPendingReports(newPage);
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
        ) : pendingReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No pending reports to verify</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingReports.map((report) => (
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
                  onClick={() => resetVerificationState()}
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
        {pendingPagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(pendingPagination.page - 1)}
              disabled={pendingPagination.page === 1}
              className="px-3 py-1 bg-slate-700 disabled:opacity-50 rounded text-white"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-400">
              Page {pendingPagination.page} of {pendingPagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pendingPagination.page + 1)}
              disabled={pendingPagination.page === pendingPagination.pages}
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
