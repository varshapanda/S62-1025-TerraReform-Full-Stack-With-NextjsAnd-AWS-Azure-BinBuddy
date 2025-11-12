import { Leaf } from "lucide-react";
import Link from "next/link";
import LoginForm from "@/components/auth/loginForm";

export const metadata = {
  title: "Login - BinBuddy",
  description: "Login to your BinBuddy account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-6 py-12">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="text-emerald-400" size={32} />
            <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              BinBuddy
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Welcome back to the waste revolution
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-6">
            Login to your account to continue
          </p>

          <LoginForm />

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-sm text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Google Login (Optional) */}
          <button className="w-full border border-slate-700 py-3 rounded-lg font-semibold text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition">
            Continue with Google
          </button>
        </div>
        {/* Back to Home */}
        <p className="text-center text-slate-400 text-sm mt-6">
          <Link
            href="/"
            className="text-emerald-400 hover:text-emerald-300 transition"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
