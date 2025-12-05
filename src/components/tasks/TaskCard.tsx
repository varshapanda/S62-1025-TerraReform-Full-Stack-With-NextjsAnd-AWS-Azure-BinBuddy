// src/components/tasks/TaskCard.tsx
"use client";

import { useState } from "react";
import {
  Truck,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

/* ------------------- TYPES ------------------- */

interface Reporter {
  name: string;
  email: string;
}

interface Report {
  category: string;
  reporter?: Reporter;
}

interface SchedulePayload {
  scheduledFor: string;
}

type QuickActionHandler = (action: string, data?: SchedulePayload) => void;

interface TaskCardProps {
  task: {
    id: string;
    status: string;
    priority: string;
    scheduledFor?: string;
    location?: { address: string };
    report?: Report;
  };
  onClick: () => void;
  showActions: boolean;
  onQuickAction?: QuickActionHandler;
}

/* ------------------- COMPONENT ------------------- */

export default function TaskCard({
  task,
  onClick,
  showActions,
  onQuickAction,
}: TaskCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "ASSIGNED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"; // BLUE
      case "IN_PROGRESS":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "LOW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle size={16} />;
      case "ASSIGNED":
        return <Clock size={16} />;
      case "SCHEDULED":
        return <Calendar size={16} />;
      case "IN_PROGRESS":
        return <Truck size={16} />;
      case "COMPLETED":
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  /* ------------------- JSX ------------------- */

  return (
    <div
      className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition cursor-pointer"
      onClick={onClick}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Truck size={18} className="text-slate-400" />
            <h3 className="text-white font-semibold text-lg capitalize">
              {task.report?.category?.toLowerCase() || "Unknown"} Waste
            </h3>
          </div>
          <p className="text-slate-400 text-sm truncate">
            {task.location?.address || "Location not specified"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(
              task.status
            )}`}
          >
            {getStatusIcon(task.status)}
            {task.status.replace("_", " ")}
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* REPORT INFO */}
      <div className="space-y-3 mb-4">
        {task.report?.reporter && (
          <div className="flex items-center text-sm text-slate-400">
            <User size={16} className="mr-2" />
            <span className="truncate">
              {task.report.reporter.name || task.report.reporter.email}
            </span>
          </div>
        )}

        {task.scheduledFor && (
          <div className="flex items-center text-sm text-slate-400">
            <Calendar size={16} className="mr-2" />
            <span>{new Date(task.scheduledFor).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
          >
            View Details
          </button>

          {task.status === "ASSIGNED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(true);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
            >
              Schedule
            </button>
          )}
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-20 bg-slate-900 border border-slate-700 rounded-xl p-4 w-64 shadow-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-white text-sm font-semibold mb-2">
            Select Date & Time
          </h3>

          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />

          <div className="flex gap-2 mt-3">
            <button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              onClick={() => {
                if (!scheduleDate) {
                  alert("Please pick a date and time");
                  return;
                }

                const iso = new Date(scheduleDate).toISOString();

                const payload: SchedulePayload = { scheduledFor: iso };

                onQuickAction?.("schedule", payload);
                setShowPopup(false);
              }}
            >
              Confirm
            </button>

            <button
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
