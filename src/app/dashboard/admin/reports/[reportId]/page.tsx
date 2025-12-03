// src/app/dashboard/admin/reports/[reportId]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";

interface Props {
  params: Promise<{ reportId: string }>;
}

interface ReportDetail {
  id: string;
  reporterId: string;
  imageUrl: string;
  category: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  note?: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
  verifiedAt?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    city?: string;
    state?: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
  verifications: Array<{
    id: string;
    decision: string;
    verificationNote?: string;
    createdAt: string;
    volunteer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  assignments: Array<{
    id: string;
    status: string;
    volunteer: {
      id: string;
      name: string;
    };
  }>;
}

export default function ReportDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const { reportId } = resolvedParams;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/admin/reports/${reportId}`);
        const data = await response.json();

        if (response.ok) {
          setReport(data.data?.report || data.report);
        } else {
          setError(data.error || "Failed to fetch report");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

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

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-400" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error || "Report not found"}</p>
            <Link
              href="/dashboard/admin/reports"
              className="inline-block mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Back to Reports
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/dashboard/admin"
            className="hover:text-emerald-400 transition"
          >
            Dashboard
          </Link>
          <ChevronRight size={16} />
          <Link
            href="/dashboard/admin/reports"
            className="hover:text-emerald-400 transition"
          >
            Reports
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">{report.category}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {report.category} Report
            </h2>
            <p className="text-slate-400">Report ID: {report.id}</p>
          </div>
          {getStatusBadge(report.status)}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="relative w-full h-96">
                <Image
                  src={report.imageUrl}
                  alt="Report"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {report.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {report.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700"
                  >
                    <Image
                      src={img.url}
                      alt="Report"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Reporter Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-white font-medium">
                      {report.reporter.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-white font-medium">
                      {report.reporter.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Location
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-white font-medium">
                      {report.address || `${report.city}, ${report.state}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Reported On</p>
                    <p className="text-white font-medium">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            {report.note && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Description
                </h3>
                <p className="text-slate-300">{report.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Verifications */}
        {report.verifications.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Verifications ({report.verifications.length})
            </h3>
            <div className="space-y-3">
              {report.verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">
                        {verification.volunteer.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {verification.volunteer.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        verification.decision === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {verification.decision}
                    </span>
                  </div>
                  {verification.verificationNote && (
                    <p className="text-sm text-slate-300 mt-2">
                      {verification.verificationNote}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(verification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/admin/reports"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            Back to Reports
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
