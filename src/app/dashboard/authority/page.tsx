// src/app/dashboard/authority/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { Truck, MapPin, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import TaskFilters from "@/components/tasks/TaskFilters";

interface Stats {
  pendingTasks: number;
  assignedTasks: number;
  inProgressTasks: number;
  scheduledTasks: number;
  completedToday: number;
  totalCompleted: number;
  tasksThisWeek: number;
  efficiency: number;
  avgCompletionTime: number;
  dailyCapacity: number;
}

interface Task {
  id: string;
  status: string;
  priority: string;
  scheduledFor?: string;
  location?: {
    address: string;
  };
  report?: {
    category: string;
    reporter?: {
      name: string;
      email: string;
    };
  };
}

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: "MY_TASKS",
    priority: "ALL",
    page: 1,
  });

  useEffect(() => {
    checkProfile();
  }, []);

  useEffect(() => {
    if (profileComplete) {
      fetchStats();
      fetchTasks();
    }
  }, [profileComplete, filters]);

  const checkProfile = async () => {
    try {
      const response = await fetch("/api/authority/profile");
      const data = await response.json();

      if (data.success) {
        if (!data.data.profile.isProfileComplete) {
          router.push("/dashboard/authority/setup");
        } else {
          setProfileComplete(true);
        }
      }
    } catch (error) {
      console.error("Profile check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/authority/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        status: filters.status,
        priority: filters.priority,
        page: filters.page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/authority/tasks?${params}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      const response = await fetch(`/api/authority/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        fetchStats();
        fetchTasks();
        setSelectedTask(null);
      } else {
        alert(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Task action error:", error);
      alert("Failed to perform action");
    }
  };

  const handleOptimizeRoute = () => {
    router.push("/dashboard/authority/route-optimizer");
  };

  if (loading) {
    return (
      <DashboardLayout role="authority">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileComplete) {
    return null; // Will redirect to setup
  }

  return (
    <DashboardLayout role="authority">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Authority Dashboard
            </h2>
            <p className="text-slate-400">Manage your waste collection tasks</p>
          </div>
          {stats && stats.assignedTasks + stats.scheduledTasks > 1 && (
            <button
              onClick={handleOptimizeRoute}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition"
            >
              <MapPin className="w-4 h-4" />
              Optimize Route
            </button>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<AlertCircle className="w-5 h-5" />}
              title="Assigned"
              value={stats.assignedTasks}
              color="blue"
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              title="Scheduled"
              value={stats.scheduledTasks}
              color="purple"
            />
            <StatCard
              icon={<Truck className="w-5 h-5" />}
              title="In Progress"
              value={stats.inProgressTasks}
              color="orange"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Completed Today"
              value={stats.completedToday}
              color="emerald"
            />
          </div>
        )}

        {/* Performance Metrics */}
        {stats && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricItem
                label="Total Completed"
                value={stats.totalCompleted.toString()}
              />
              <MetricItem
                label="This Week"
                value={stats.tasksThisWeek.toString()}
              />
              <MetricItem label="Efficiency" value={`${stats.efficiency}%`} />
              <MetricItem
                label="Avg Time"
                value={`${stats.avgCompletionTime} min`}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={setFilters} />

        {/* Tasks List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Your Tasks</h3>
          {tasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tasks found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                  showActions={
                    task.status === "PENDING" || task.status === "ASSIGNED"
                  }
                  onQuickAction={(action) => handleTaskAction(task.id, action)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onAction={handleTaskAction}
        />
      )}
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "blue" | "purple" | "orange" | "emerald";
}) {
  const colorClasses = {
    blue: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    orange: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={colorClasses[color]}>{icon}</div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-white text-xl font-semibold">{value}</p>
    </div>
  );
}
