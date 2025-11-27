import Link from "next/link";
import { Leaf } from "lucide-react";
import ResetPasswordForm from "@/components/auth/resetPasswordForm";

export const metadata = {
  title: "Reset Password - BinBuddy",
  description: "Set a new password for your BinBuddy account",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-6 py-12">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="text-emerald-400" size={32} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              BinBuddy
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Create a new password</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter your new password below.
          </p>

          <ResetPasswordForm />
        </div>

        {/* Back to Login */}
        <p className="text-center text-slate-400 text-sm mt-6">
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 transition"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
