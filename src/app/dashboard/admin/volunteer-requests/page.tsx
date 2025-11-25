// app/dashboard/admin/volunteer-requests/page.tsx

"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Define proper types based on your schema
type VolunteerRequest = {
  id: number;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
};

type FilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function VolunteerRequestsPage() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("PENDING");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url =
        filter === "ALL"
          ? "/api/admin/volunteer-requests"
          : `/api/admin/volunteer-requests?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.data?.requests || data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    requestId: number,
    action: "approve" | "reject"
  ) => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) {
      return;
    }

    setProcessingId(requestId);
    try {
      const response = await fetch(
        `/api/admin/volunteer-requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        fetchRequests();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <Clock size={12} />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle size={12} />
            Approved
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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/dashboard/admin"
            className="hover:text-emerald-400 transition"
          >
            Dashboard
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">Volunteer Requests</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Volunteer Requests
          </h2>
          <p className="text-slate-400">
            Review and manage volunteer applications
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === tab
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
        ) : requests.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <p className="text-slate-400">
              No {filter.toLowerCase()} requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {request.user.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {request.user.email}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-slate-400">User Since:</span>
                    <p className="font-medium text-white">
                      {new Date(request.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Requested:</span>
                    <p className="font-medium text-white">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.status === "PENDING" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAction(request.id, "approve")}
                      disabled={processingId === request.id}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(request.id, "reject")}
                      disabled={processingId === request.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
