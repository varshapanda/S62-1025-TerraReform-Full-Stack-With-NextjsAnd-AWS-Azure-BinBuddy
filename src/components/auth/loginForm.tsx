"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const addNotification = useUIStore((state) => state.addNotification);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for URL parameters
  useEffect(() => {
    const message = searchParams.get("message");
    const urlError = searchParams.get("error");

    if (message === "verification_success") {
      setSuccessMessage("Email verified successfully! You can now log in.");
    } else if (message === "already_verified") {
      setSuccessMessage("Your email is already verified. Please log in.");
    } else if (message === "password_reset_success") {
      setSuccessMessage(
        "Password reset successfully! You can now log in with your new password."
      );
    } else if (message === "signup_success") {
      setSuccessMessage(
        "Account created successfully! Please check your email inbox or spam folder to verify your account before logging in."
      );
    } else if (urlError === "invalid_token") {
      setError(
        "Invalid verification link. The token was not found in our system."
      );
    } else if (urlError === "expired_token") {
      setError(
        "Your verification link has expired. Please sign up again or contact support."
      );
    } else if (urlError === "missing_token") {
      setError("Verification link is invalid or incomplete.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login...");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            "Please verify your email before logging in. Check your inbox for the verification link."
          );
        } else {
          setError(data.message || "Login failed");
        }
        return;
      }

      // Store user data in Zustand
      setUser({
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        points: data.data.user.points,
        emailVerified: true,
      });

      addNotification(`Welcome back, ${data.data.user.name}!`, "success");

      console.log("Login successful, redirecting to dashboard...");

      // Redirect to role-based dashboard
      const dashboardPath = getDashboardRoute();
      router.push(dashboardPath);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-emerald-400 mt-0.5" size={18} />
          <p className="text-emerald-300 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5" size={18} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300">
          <input
            type="checkbox"
            className="w-4 h-4 bg-slate-800 border border-slate-700 rounded cursor-pointer"
            disabled={loading}
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-emerald-400 hover:text-emerald-300 transition"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-emerald-500 to-green-500 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Logging in...
          </>
        ) : (
          <>
            Login
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Signup Link */}
      <p className="text-center text-slate-400 text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
        >
          Sign up here
        </Link>
      </p>
    </form>
  );
}
