import Link from "next/link";
import SignupForm from "@/components/auth/signupForm";

export const metadata = {
  title: "Sign Up - BinBuddy",
  description: "Create your BinBuddy account and start making a difference",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-6 py-12">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              BinBuddy
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Join the community making waste segregation easy
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm mb-6">
            Fill in your details to get started
          </p>

          <SignupForm />

          {/* Privacy Notice */}
          <p className="text-xs text-slate-500 text-center mt-6">
            By signing up, you agree to our{" "}
            <a href="#" className="text-emerald-400 hover:text-emerald-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-emerald-400 hover:text-emerald-300">
              Privacy Policy
            </a>
          </p>
        </div>

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
