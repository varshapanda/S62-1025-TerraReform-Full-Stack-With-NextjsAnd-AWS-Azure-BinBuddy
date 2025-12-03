"use client";

import { useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import {
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  AlertCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAuthorityStore } from "@/store/authorityStore";

// Define types for the task data
interface Report {
  category?: string;
}

interface TaskLocation {
  address?: string;
}

interface Task {
  id: string;
  priority: string;
  status: string;
  report?: Report;
  location?: TaskLocation;
}

interface Stats {
  pending?: number;
  assigned?: number;
  inProgress?: number;
  completedToday?: number;
  efficiency?: number;
}

export default function AuthorityDashboardPage() {
  const {
    stats,
    tasks,
    myTasks,
    loading,
    fetchStats,
    fetchMyTasks,
    assignToMe,
  } = useAuthorityStore();

  useEffect(() => {
    fetchStats();
    fetchMyTasks();
  }, [fetchStats, fetchMyTasks]);

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
      HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return (
      colors[priority] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "ASSIGNED":
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getPriorityIconColor = (priority: string): string => {
    const colors: Record<string, string> = {
      URGENT: "text-red-400",
      HIGH: "text-amber-400",
      MEDIUM: "text-blue-400",
      LOW: "text-emerald-400",
    };
    return colors[priority] || "text-slate-400";
  };

  const typedStats: Stats = stats || {};
  const typedTasks: Task[] = tasks || [];
  const typedMyTasks: Task[] = myTasks || [];

  return (
    <DashboardLayout role="authority">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Authority Dashboard
            </h1>
            <p className="text-slate-400 text-lg">
              Manage waste collection tasks and operations
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Awaiting
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Pending Tasks
              </h3>
              <p className="text-4xl font-bold text-white">
                {typedStats.pending || 0}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-600/50 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Truck className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-400">
                  Active
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                My Active Tasks
              </h3>
              <p className="text-4xl font-bold text-white">
                {(typedStats.assigned || 0) + (typedStats.inProgress || 0)}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-600/50 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Today
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Completed Today
              </h3>
              <p className="text-4xl font-bold text-white">
                {typedStats.completedToday || 0}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-600/50 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Rate</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                Efficiency
              </h3>
              <p className="text-4xl font-bold text-white">
                {typedStats.efficiency || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/authority/tasks"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
              <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-2">
                Available Tasks
              </h4>
              <p className="text-blue-100 text-base leading-relaxed">
                View and assign waste collection tasks in your service areas
              </p>
              <div className="mt-6 inline-flex items-center text-white font-semibold">
                <span>Browse Tasks</span>
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/authority/schedule"
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-8 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
              <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-2">
                Schedule Tasks
              </h4>
              <p className="text-emerald-100 text-base leading-relaxed">
                Plan and schedule collection routes for maximum efficiency
              </p>
              <div className="mt-6 inline-flex items-center text-white font-semibold">
                <span>View Schedule</span>
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* My Active Tasks */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">My Active Tasks</h3>
            {typedMyTasks.length > 0 && (
              <span className="text-sm text-slate-400 font-medium">
                {typedMyTasks.length} total tasks
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : typedMyTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-slate-700/30 rounded-2xl mb-4">
                <AlertCircle className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">No tasks assigned</p>
              <p className="text-slate-500 text-sm mb-6">
                Browse available tasks to start collecting
              </p>
              <Link
                href="/dashboard/authority/tasks"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Browse Tasks
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {typedMyTasks.slice(0, 5).map((task: Task) => {
                const priorityColor = getPriorityColor(task.priority);
                const statusColor = getStatusColor(task.status);
                const iconColor = getPriorityIconColor(task.priority);

                return (
                  <div
                    key={task.id}
                    className="group bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 ${priorityColor.split(" ")[0]} rounded-lg`}
                        >
                          <Truck className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg capitalize">
                            {(task.report?.category || "Unknown").toLowerCase()}{" "}
                            Waste
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <p className="text-slate-400 text-sm">
                              {task.location?.address ||
                                "Location not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusColor}`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${priorityColor}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typedMyTasks.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/dashboard/authority/tasks"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View all {typedMyTasks.length} tasks</span>
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Assign - Available Tasks */}
        {typedTasks.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Available Tasks Near You
              </h3>
              <span className="text-sm text-slate-400 font-medium">
                {typedTasks.length} pending tasks
              </span>
            </div>

            <div className="space-y-3">
              {typedTasks.slice(0, 3).map((task: Task) => {
                const priorityColor = getPriorityColor(task.priority);
                const iconColor = getPriorityIconColor(task.priority);

                return (
                  <div
                    key={task.id}
                    className="group bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 ${priorityColor.split(" ")[0]} rounded-lg`}
                        >
                          <MapPin className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg capitalize">
                            {(task.report?.category || "Unknown").toLowerCase()}{" "}
                            Waste
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <p className="text-slate-400 text-sm">
                              {task.location?.address ||
                                "Location not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${priorityColor}`}
                        >
                          {task.priority}
                        </span>
                        <button
                          onClick={() => assignToMe(task.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Assign to Me
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typedTasks.length > 3 && (
                <div className="text-center pt-4">
                  <Link
                    href="/dashboard/authority/tasks"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View all {typedTasks.length} available tasks</span>
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
