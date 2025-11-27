"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.password || !formData.confirmPassword) {
      setError("Both password fields are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      // Redirect to login with success message
      router.push("/login?message=password_reset_success");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-red-400 mt-0.5" size={20} />
        <div>
          <p className="text-red-300 text-sm font-medium mb-1">
            Invalid Reset Link
          </p>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5" size={18} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* New Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          New Password
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
            placeholder="Enter new password (min 8 characters)"
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

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="text-xs text-slate-400 space-y-1">
        <p className={formData.password.length >= 8 ? "text-emerald-400" : ""}>
          • At least 8 characters
        </p>
        <p
          className={
            formData.password === formData.confirmPassword && formData.password
              ? "text-emerald-400"
              : ""
          }
        >
          • Passwords match
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !token}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Resetting Password...
          </>
        ) : (
          <>
            <CheckCircle size={18} />
            Reset Password
          </>
        )}
      </button>
    </form>
  );
}
