// src/components/tasks/TaskModal.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { X, MapPin, User, Calendar, Image as ImageIcon } from "lucide-react";
import { formatDateTime, getMinDateTime } from "@/lib/dateUtils";

interface TaskLocation {
  address: string;
  lat?: number;
  lng?: number;
}

interface TaskReporter {
  name: string;
  email: string;
}

interface TaskReportImage {
  url: string;
}

interface TaskReport {
  category: string;
  note?: string;
  imageUrl?: string;
  reporter?: TaskReporter;
  images?: TaskReportImage[];
}

interface Task {
  id: string;
  status: string;
  priority: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  location?: TaskLocation;
  report?: TaskReport;
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onAction: (
    taskId: string,
    action: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>
  ) => Promise<void>;
}

export default function TaskModal({ task, onClose, onAction }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleAction = async (
    action: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>
  ) => {
    setLoading(true);
    setActionType(action);
    try {
      console.log("🔄 TaskModal handleAction called:", {
        action,
        additionalData,
        taskId: task.id,
      });

      await onAction(task.id, action, additionalData);

      console.log("✅ Action completed successfully");
      onClose();
    } catch (error) {
      console.error("❌ Action failed:", error);
      alert("Failed to perform action. Please try again.");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleScheduleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScheduleDate(value);
    console.log("📅 Schedule date changed:", value);
  };

  const handleScheduleSubmit = () => {
    if (!scheduleDate) {
      alert("Please select a date and time");
      return;
    }

    try {
      // Convert datetime-local value to ISO string
      const dateObj = new Date(scheduleDate);

      if (isNaN(dateObj.getTime())) {
        alert("Invalid date selected");
        return;
      }

      const isoDate = dateObj.toISOString();

      console.log("🚀 Scheduling task:", {
        rawInput: scheduleDate,
        dateObj: dateObj,
        isoDate: isoDate,
      });

      handleAction("schedule", { scheduledFor: isoDate });
    } catch (error) {
      console.error("Date conversion error:", error);
      alert("Failed to process date. Please try again.");
    }
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "ASSIGNED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "SCHEDULED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "IN_PROGRESS":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
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

  const canAssign = task.status === "PENDING";
  const canSchedule = task.status === "ASSIGNED";
  const canStart = task.status === "ASSIGNED" || task.status === "SCHEDULED";
  const canComplete = task.status === "IN_PROGRESS";
  const canCancel = !["COMPLETED", "CANCELLED"].includes(task.status);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {task.report?.category} Collection
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(task.status)}`}
              >
                {task.status.replace("_", " ")}
              </span>
              <span
                className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}
              >
                {task.priority} Priority
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h4>
            <p className="text-white">
              {task.location?.address || "No address provided"}
            </p>
            {task.location?.lat && task.location?.lng && (
              <p className="text-sm text-slate-400 mt-1">
                Coordinates: {task.location.lat.toFixed(6)},{" "}
                {task.location.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Reporter */}
          {task.report?.reporter && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Reporter
              </h4>
              <p className="text-white">{task.report.reporter.name}</p>
              <p className="text-sm text-slate-400">
                {task.report.reporter.email}
              </p>
            </div>
          )}

          {/* Schedule */}
          {task.scheduledFor && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled For
              </h4>
              <p className="text-white text-lg font-semibold">
                {formatDateTime(task.scheduledFor)}
              </p>
            </div>
          )}

          {/* Started At */}
          {task.startedAt && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Started At
              </h4>
              <p className="text-white">{formatDateTime(task.startedAt)}</p>
            </div>
          )}

          {/* Completed At */}
          {task.completedAt && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Completed At
              </h4>
              <p className="text-white">{formatDateTime(task.completedAt)}</p>
            </div>
          )}

          {/* Note */}
          {task.report?.note && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                Note from Reporter
              </h4>
              <p className="text-white bg-slate-900/50 p-3 rounded-lg">
                {task.report.note}
              </p>
            </div>
          )}

          {/* Images */}
          {task.report?.images && task.report.images.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {task.report.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Waste ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Schedule Form */}
          {canSchedule && actionType === "schedule" && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">
                Schedule Collection
              </h4>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={handleScheduleDateChange}
                min={getMinDateTime()}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
              {scheduleDate && (
                <p className="text-sm text-slate-400 mt-2">
                  Selected: {new Date(scheduleDate).toLocaleString()}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || loading}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? "Scheduling..." : "Confirm Schedule"}
                </button>
                <button
                  onClick={() => {
                    setActionType(null);
                    setScheduleDate("");
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Complete Form */}
          {canComplete && actionType === "complete" && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">
                Complete Collection
              </h4>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about the collection..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 min-h-[100px] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction("complete", { notes })}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? "Completing..." : "Mark as Complete"}
                </button>
                <button
                  onClick={() => {
                    setActionType(null);
                    setNotes("");
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!actionType && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-2 gap-3">
              {canAssign && (
                <button
                  onClick={() => handleAction("assign")}
                  disabled={loading}
                  className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {loading && actionType === "assign"
                    ? "Assigning..."
                    : "Assign to Me"}
                </button>
              )}
              {canSchedule && (
                <button
                  onClick={() => setActionType("schedule")}
                  disabled={loading}
                  className="py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
                >
                  Schedule
                </button>
              )}
              {canStart && (
                <button
                  onClick={() => handleAction("start")}
                  disabled={loading}
                  className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {loading && actionType === "start"
                    ? "Starting..."
                    : "Start Collection"}
                </button>
              )}
              {canComplete && (
                <button
                  onClick={() => setActionType("complete")}
                  disabled={loading}
                  className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
                >
                  Complete
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={loading}
                  className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {loading && actionType === "cancel"
                    ? "Cancelling..."
                    : "Cancel Task"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
