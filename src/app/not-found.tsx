"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-8xl font-bold bg-linear-to-r from-emerald-500 to-green-900 bg-clip-text text-transparent mb-4">
          404
        </h1>

        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>

        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-emerald-800 to-green px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition"
          >
            <Home size={20} />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border border-slate-600 px-6 py-3 rounded-lg font-semibold hover:border-emerald-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
