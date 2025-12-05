// src/app/dashboard/authority/route-optimizer/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import MessageToast from "@/components/authority/MessageToast";
import ConfirmDialog from "@/components/authority/ConfirmDialog";
import { useAuthorityStore } from "@/store/authorityStore";
import { MapPin, Navigation, Clock, ArrowRight, Truck } from "lucide-react";

interface Task {
  id: string;
  priority: string;
  location: {
    address?: string;
  };
  report: {
    category: string;
  };
}

interface OptimizedStop {
  id: string;
  lat: number;
  lng: number;
  address: string | null;
  category: string;
  priority: string;
  distanceFromPrevious: number;
  estimatedCollectionTime: number;
  task: Task;
}

interface RouteStats {
  totalDistance: number;
  travelTime: number;
  collectionTime: number;
  totalTime: number;
  totalStops: number;
}

interface OptimizedRoute {
  optimizedRoute: OptimizedStop[];
  routeStats: RouteStats;
  totalTasks: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    tasks: Task[];
  };
  error?: string;
}

export default function RouteOptimizerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(
    null
  );

  const { showMessage, showConfirmDialog, hideConfirmDialog, confirmDialog } =
    useAuthorityStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "/api/authority/my-tasks?status=ASSIGNED&limit=50"
      );
      const data: ApiResponse = await response.json();

      if (data.success) {
        setTasks(data.data.tasks);
        // Auto-select all tasks
        setSelectedTasks(data.data.tasks.map((t: Task) => t.id));
      } else {
        showMessage("error", data.error || "Failed to load tasks");
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      showMessage("error", "Failed to load tasks");
    }
  };

  const handleOptimize = async () => {
    if (selectedTasks.length === 0) {
      showMessage("error", "Please select at least one task");
      return;
    }

    showConfirmDialog({
      title: "Optimize Route",
      message: `This will optimize the route for ${selectedTasks.length} selected task${selectedTasks.length > 1 ? "s" : ""}. Continue?`,
      confirmText: "Optimize",
      onConfirm: () => {
        hideConfirmDialog();
        performOptimization();
      },
    });
  };

  const performOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/authority/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskIds: selectedTasks,
          optimizeFor: "distance",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimizedRoute(data.data);
        showMessage("success", "Route optimized successfully!");
      } else {
        showMessage("error", data.error || "Optimization failed");
      }
    } catch (error) {
      console.error("Optimize error:", error);
      showMessage("error", "Failed to optimize route");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCollection = () => {
    showConfirmDialog({
      title: "Start Collection",
      message:
        "You will be redirected to your dashboard to begin the collection route. Continue?",
      confirmText: "Start",
      onConfirm: () => {
        hideConfirmDialog();
        router.push("/dashboard/authority");
      },
    });
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-400";
      case "HIGH":
        return "text-orange-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "LOW":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <DashboardLayout role="authority">
      <MessageToast />
      {confirmDialog?.isOpen && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={hideConfirmDialog}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Route Optimizer
            </h2>
            <p className="text-slate-400">
              Optimize your collection route for efficiency
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>

        {!optimizedRoute ? (
          <>
            {/* Task Selection */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Select Tasks ({selectedTasks.length}/{tasks.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTasks(tasks.map((t) => t.id))}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedTasks([])}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                      selectedTasks.includes(task.id)
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-slate-900/50 border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {task.report.category}
                        </span>
                        <span
                          className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {task.location?.address || "No address"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              disabled={loading || selectedTasks.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>Optimize Route ({selectedTasks.length} tasks)</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* Route Statistics */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Optimized Route Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RouteStat
                  icon={<MapPin className="w-5 h-5" />}
                  label="Total Distance"
                  value={`${optimizedRoute.routeStats.totalDistance} km`}
                />
                <RouteStat
                  icon={<Clock className="w-5 h-5" />}
                  label="Travel Time"
                  value={`${optimizedRoute.routeStats.travelTime} min`}
                />
                <RouteStat
                  icon={<Truck className="w-5 h-5" />}
                  label="Collection Time"
                  value={`${optimizedRoute.routeStats.collectionTime} min`}
                />
                <RouteStat
                  icon={<Navigation className="w-5 h-5" />}
                  label="Total Time"
                  value={`${optimizedRoute.routeStats.totalTime} min`}
                />
              </div>
            </div>

            {/* Optimized Route Steps */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Route Steps
              </h3>
              <div className="space-y-4">
                {optimizedRoute.optimizedRoute.map((stop, index) => (
                  <div key={stop.id} className="relative">
                    {index < optimizedRoute.optimizedRoute.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-blue-500/30" />
                    )}
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-semibold">
                              {stop.category}
                            </h4>
                            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {stop.address}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold ${getPriorityColor(stop.priority)}`}
                          >
                            {stop.priority}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-slate-400 mt-3">
                          {index > 0 && (
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              {stop.distanceFromPrevious.toFixed(2)} km
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {stop.estimatedCollectionTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setOptimizedRoute(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
              >
                Re-optimize
              </button>
              <button
                onClick={handleStartCollection}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition"
              >
                Start Collection
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function RouteStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-blue-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}
