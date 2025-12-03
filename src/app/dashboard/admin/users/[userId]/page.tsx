"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import Link from "next/link";
import {
  ChevronRight,
  User,
  Mail,
  MapPin,
  Calendar,
  Award,
  Shield,
  Loader2,
} from "lucide-react";

interface Props {
  params: Promise<{ userId: string }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  state?: string;
  city?: string;
  createdAt: string;
  reportsCount: number;
  tasksCompleted: number;
}

export default function UserDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const { userId } = resolvedParams;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data.data?.user || data.user);
        } else {
          setError(data.error || "Failed to fetch user");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      user: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      volunteer: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      authority: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      admin: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };
    return colors[role.toLowerCase()] || colors.user;
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

  if (error || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error || "User not found"}</p>
            <Link
              href="/dashboard/admin/users"
              className="inline-block mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Back to User List
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
            href="/dashboard/admin/users"
            className="hover:text-emerald-400 transition"
          >
            User Management
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">{user.name}</span>
        </div>

        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
          <p className="text-slate-400">Viewing details for {user.name}</p>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-700 rounded-full">
                <User size={32} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  <Shield size={12} />
                  {user.role}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Total Points</p>
              <p className="text-3xl font-bold text-emerald-400">
                {user.points}
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
              <Mail className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
              <MapPin className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-white font-medium">
                  {user.city && user.state
                    ? `${user.city}, ${user.state}`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
              <Calendar className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="text-white font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
              <Award className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Reports Submitted</p>
                <p className="text-white font-medium">{user.reportsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-slate-400 text-sm mb-2">Reports Submitted</h4>
            <p className="text-3xl font-bold text-blue-400">
              {user.reportsCount}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-slate-400 text-sm mb-2">Tasks Completed</h4>
            <p className="text-3xl font-bold text-emerald-400">
              {user.tasksCompleted}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-slate-400 text-sm mb-2">Points Earned</h4>
            <p className="text-3xl font-bold text-amber-400">{user.points}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/admin/users"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            Back to User List
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
