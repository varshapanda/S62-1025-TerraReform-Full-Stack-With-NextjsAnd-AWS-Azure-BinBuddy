// src/components/tasks/TaskModal.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { X, MapPin, User, Calendar, Image as ImageIcon } from "lucide-react";
import { formatDateTime } from "@/lib/dateUtils";

/* ----------------------------- Types ----------------------------- */
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
  reporter?: TaskReporter;
  images?: TaskReportImage[];
}

export interface Task {
  id: string;
  status: string;
  priority: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  location?: TaskLocation;
  report?: TaskReport;
}

/*  
  🔥 FIX 1: Correct ActionPayload type  
  It MUST match the TasksPage "additionalData" shape exactly.
*/
type ActionPayload = {
  [key: string]: string | string[] | undefined;
};

interface TaskModalProps {
  task: Task;
  onClose: () => void;

  /*  
    🔥 FIX 2: Update onAction type to match TasksPage 
    This removes the red underline!
  */
  onAction: (
    taskId: string,
    action: string,
    data?: { [key: string]: string | string[] | undefined }
  ) => Promise<void>;
}

/* --------------------------- Component ---------------------------- */

export default function TaskModal({ task, onClose, onAction }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  /* -------------------------- Handlers --------------------------- */

  const handleAction = async (action: string, data?: ActionPayload) => {
    setLoading(true);
    setActionType(action);

    try {
      await onAction(task.id, action, data);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to perform action. Please try again.");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  /* --------------------------- UI Utils --------------------------- */

  const getStatusColor = (status: string): string => {
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

  const getPriorityColor = (priority: string): string => {
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

  /* --------------------------- Permissions --------------------------- */

  const canAssign = task.status === "PENDING";
  const canStart = task.status === "ASSIGNED" || task.status === "SCHEDULED";
  const canComplete = task.status === "IN_PROGRESS";
  const canCancel = !["COMPLETED", "CANCELLED"].includes(task.status);

  /* --------------------------- JSX --------------------------- */

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
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h4>
            <p className="text-white">{task.location?.address}</p>
          </div>

          {/* Reporter */}
          {task.report?.reporter && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Reporter
              </h4>
              <p className="text-white">{task.report.reporter.name}</p>
              <p className="text-sm text-slate-400">
                {task.report.reporter.email}
              </p>
            </div>
          )}

          {/* Scheduled */}
          {task.scheduledFor && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Scheduled For
              </h4>
              <p className="text-white text-lg font-semibold">
                {formatDateTime(task.scheduledFor)}
              </p>
            </div>
          )}

          {/* Started */}
          {task.startedAt && (
            <>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Started At
              </h4>
              <p className="text-white">{formatDateTime(task.startedAt)}</p>
            </>
          )}

          {/* Completed */}
          {task.completedAt && (
            <>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Completed At
              </h4>
              <p className="text-white">{formatDateTime(task.completedAt)}</p>
            </>
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

          {/* Complete Form */}
          {canComplete && actionType === "complete" && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">
                Complete Collection
              </h4>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add notes..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white min-h-[100px]"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction("complete", { notes })}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                >
                  {loading ? "Completing..." : "Mark as Complete"}
                </button>

                <button
                  onClick={() => setActionType(null)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!actionType && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-2 gap-3">
              {canAssign && (
                <button
                  onClick={() => handleAction("assign")}
                  disabled={loading}
                  className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Assign to Me
                </button>
              )}

              {canStart && (
                <button
                  onClick={() => handleAction("start")}
                  disabled={loading}
                  className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
                >
                  Start Collection
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => setActionType("complete")}
                  disabled={loading}
                  className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Complete
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={loading}
                  className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold"
                >
                  Cancel Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
