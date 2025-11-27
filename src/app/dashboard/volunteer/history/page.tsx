"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { useVolunteerStore } from "@/store/volunteerStore";

export default function VerificationHistoryPage() {
  const router = useRouter();
  const {
    historyReports,
    loading,
    statusFilter,
    historyPagination,
    fetchHistoryReports,
    setStatusFilter,
  } = useVolunteerStore();

  useEffect(() => {
    fetchHistoryReports(statusFilter);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "REJECTED":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getVerificationNote = (report: (typeof historyReports)[0]) => {
    return report.remarks || report.rejectionReason;
  };

  const getImageUrl = (report: (typeof historyReports)[0]) => {
    return report.images?.[0]?.url || report.imageUrl;
  };

  const getFormattedAddress = (report: (typeof historyReports)[0]) => {
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
    fetchHistoryReports(statusFilter, newPage);
  };

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verification History
            </h2>
            <p className="text-slate-400">
              View your past report verifications
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/volunteer")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStatusFilter("VERIFIED")}
            className={`px-4 py-2 rounded-lg transition ${
              statusFilter === "VERIFIED"
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-lg transition ${
              statusFilter === "REJECTED"
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            Rejected
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Loading history...</p>
          </div>
        ) : historyReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No verification history found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {historyReports.map((report) => (
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
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold">
                        {report.category}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(report.status || "")}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mb-4">
                      {report.note || "No additional notes"}
                    </p>
                    {getVerificationNote(report) && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-300 mb-1">
                          <strong>Verification Note:</strong>
                        </p>
                        <p className="text-sm text-slate-400">
                          {getVerificationNote(report)}
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-slate-500 space-y-1">
                      <p>
                        Reported by:{" "}
                        {report.reporter.name || report.reporter.email}
                      </p>
                      <p>
                        Reported:{" "}
                        {new Date(report.createdAt).toLocaleDateString("en-GB")}
                      </p>
                      <p>
                        Verified:{" "}
                        {report.verifiedAt
                          ? new Date(report.verifiedAt).toLocaleString("en-GB")
                          : "N/A"}
                      </p>
                      <p className="flex items-start gap-1">
                        <span className="font-semibold">Location:</span>
                        <span className="flex-1">
                          {getFormattedAddress(report)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {historyPagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(historyPagination.page - 1)}
              disabled={historyPagination.page === 1}
              className="px-3 py-1 bg-slate-700 disabled:opacity-50 rounded text-white"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-400">
              Page {historyPagination.page} of {historyPagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(historyPagination.page + 1)}
              disabled={historyPagination.page === historyPagination.pages}
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
