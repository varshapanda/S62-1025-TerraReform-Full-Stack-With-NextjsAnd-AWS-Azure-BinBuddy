// src/components/authority/MessageToast.tsx
"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { useAuthorityStore } from "@/store/authorityStore";

export default function MessageToast() {
  const { message, clearMessage } = useAuthorityStore();

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
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 ${
          message.type === "success"
            ? "bg-emerald-600 border-emerald-500 text-white"
            : "bg-red-600 border-red-500 text-white"
        }`}
      >
        {message.type === "success" ? (
          <CheckCircle size={20} className="flex-shrink-0" />
        ) : (
          <XCircle size={20} className="flex-shrink-0" />
        )}
        <p className="font-semibold">{message.text}</p>
        <button
          onClick={clearMessage}
          className="ml-2 hover:bg-white/20 rounded p-1 transition flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
