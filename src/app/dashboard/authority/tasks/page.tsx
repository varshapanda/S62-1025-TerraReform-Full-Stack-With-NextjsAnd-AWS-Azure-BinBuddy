// src/app/dashboard/authority/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import TaskFilters from "@/components/tasks/TaskFilters";
import MessageToast from "@/components/authority/MessageToast";
import ConfirmDialog from "@/components/authority/ConfirmDialog";
import { useAuthorityStore } from "@/store/authorityStore";
import { Truck, ChevronLeft, ChevronRight } from "lucide-react";

interface Location {
  address: string;
}

interface Reporter {
  name: string;
  email: string;
}

interface Report {
  category: string;
  reporter?: Reporter;
}

interface Task {
  id: string;
  status: string;
  priority: string;
  scheduledFor?: string;
  location?: Location;
  report?: Report;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  status: string;
  priority: string;
  page: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: Pagination;
  };
  error?: string;
}

interface TaskActionResponse {
  success: boolean;
  error?: string;
}

interface AdditionalData {
  [key: string]: string | string[] | undefined;
}

export default function AuthorityTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    priority: "ALL",
    page: 1,
  });

  const { showMessage, showConfirmDialog, hideConfirmDialog, confirmDialog } =
    useAuthorityStore();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filters.status,
        priority: filters.priority,
        page: filters.page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/authority/tasks?${params}`, {
        method: "GET",
        credentials: "include",
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setTasks(data.data.tasks);
        setPagination(data.data.pagination);
      } else {
        showMessage("error", data.error || "Failed to load tasks");
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      showMessage("error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (
    taskId: string,
    action: string,
    additionalData?: AdditionalData
  ) => {
    // Show confirmation for critical actions
    if (action === "complete" || action === "cancel") {
      showConfirmDialog({
        title: `${action === "complete" ? "Complete" : "Cancel"} Task`,
        message: `Are you sure you want to ${action} this task? This action cannot be undone.`,
        confirmText: action === "complete" ? "Complete" : "Cancel Task",
        onConfirm: () => {
          hideConfirmDialog();
          performTaskAction(taskId, action, additionalData);
        },
      });
      return;
    }

    // For other actions, proceed directly
    performTaskAction(taskId, action, additionalData);
  };

  const performTaskAction = async (
    taskId: string,
    action: string,
    additionalData?: AdditionalData
  ) => {
    try {
      const response = await fetch(`/api/authority/tasks/${taskId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...additionalData }),
      });

      const data: TaskActionResponse = await response.json();

      if (data.success) {
        showMessage("success", "Task updated successfully");
        fetchTasks();
        setSelectedTask(null);
      } else {
        showMessage("error", data.error || "Action failed");
      }
    } catch (error) {
      console.error("Task action error:", error);
      showMessage("error", "Failed to perform action");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters({ ...filters, page: newPage });
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
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">All Tasks</h2>
          <p className="text-slate-400">
            View and manage all waste collection tasks
          </p>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={setFilters} />

        {/* Stats Summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">
                Showing {tasks.length} of {pagination.total} tasks
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tasks found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your filters or check back later
            </p>
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
                onQuickAction={(action, data) =>
                  handleTaskAction(task.id, action, data)
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    Math.abs(page - pagination.page) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          pagination.page === page
                            ? "bg-blue-500 text-white"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-slate-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
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
