"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

export default function MessageToast() {
  const { message, clearMessage } = useAdminStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          message.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        {message.type === "success" ? (
          <CheckCircle size={20} />
        ) : (
          <XCircle size={20} />
        )}
        <p className="font-medium">{message.text}</p>
        <button
          onClick={clearMessage}
          className="ml-2 hover:opacity-70 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
