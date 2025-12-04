// src/app/dashboard/authority/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { useAuthorityStore } from "@/store/authorityStore";
import { MapPin, Truck, Edit, CheckCircle, TrendingUp } from "lucide-react";

export default function AuthorityProfilePage() {
  const router = useRouter();
  const { profile, loading, fetchProfile } = useAuthorityStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="authority">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="authority">
        <div className="text-center py-12">
          <p className="text-slate-400">Failed to load profile</p>
          <button
            onClick={() => fetchProfile()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="authority">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Profile</h2>
            <p className="text-slate-400">
              View and manage your authority profile
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/authority/setup")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Profile Status */}
        <div
          className={`border rounded-xl p-6 ${
            profile.isProfileComplete
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {profile.isProfileComplete ? (
              <>
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-emerald-400 font-semibold">
                    Profile Complete
                  </h3>
                  <p className="text-emerald-300/70 text-sm">
                    You are ready to receive task assignments
                  </p>
                </div>
              </>
            ) : (
              <>
                <Edit className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-amber-400 font-semibold">
                    Profile Incomplete
                  </h3>
                  <p className="text-amber-300/70 text-sm">
                    Complete your profile to start receiving tasks
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Name" value={profile.name} />
            <InfoItem label="Email" value={profile.email} />
            <InfoItem label="Role" value={profile.role.toUpperCase()} />
            <InfoItem label="City" value={profile.city || "Not set"} />
            <InfoItem label="State" value={profile.state || "Not set"} />
          </div>
        </div>

        {/* Operational Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Operational Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem
              label="Vehicle Type"
              value={profile.vehicleType || "Not set"}
            />
            <InfoItem
              label="Service Radius"
              value={
                profile.serviceRadius
                  ? `${profile.serviceRadius} km`
                  : "Not set"
              }
            />
            <InfoItem
              label="Max Tasks/Day"
              value={profile.maxTasksPerDay?.toString() || "Not set"}
            />
          </div>
          {profile.baseLat && profile.baseLng && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Base Coordinates</p>
              <p className="text-white font-mono text-sm">
                {profile.baseLat.toFixed(6)}, {profile.baseLng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Service Areas */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Areas ({profile.serviceAreas.length})
          </h3>
          {profile.serviceAreas.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No service areas configured
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.serviceAreas.map((area, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-900/50 border border-slate-600 rounded-lg"
                >
                  <p className="text-white font-semibold">
                    {area.locality}, {area.city}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {area.state} • Priority{" "}
                    {area.priority === 1 ? "Primary" : "Secondary"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              label="Tasks Completed"
              value={profile.tasksCompleted.toString()}
              color="blue"
            />
            <StatItem
              label="Completion Rate"
              value={`${profile.completionRate}%`}
              color="emerald"
            />
            <StatItem
              label="Avg Time"
              value={
                profile.avgCompletionTime
                  ? `${profile.avgCompletionTime} min`
                  : "N/A"
              }
              color="purple"
            />
            <StatItem
              label="Status"
              value={profile.isProfileComplete ? "Active" : "Inactive"}
              color={profile.isProfileComplete ? "emerald" : "amber"}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "emerald" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
  };

  return (
    <div className="text-center p-4 bg-slate-900/50 rounded-lg">
      <p className={`text-2xl font-bold ${colorClasses[color]} mb-1`}>
        {value}
      </p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
