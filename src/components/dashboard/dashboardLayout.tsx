"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Award,
  Menu,
  X,
  ChevronRight,
  Crown,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "volunteer" | "authority" | "admin";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        console.error("Response not OK:", response.status);
        router.push("/login");
        return;
      }

      const data = await response.json();

      let userData: UserData | null = null;

      if (data.user) {
        userData = data.user;
      } else if (data.data && data.data.user) {
        userData = data.data.user;
      } else if (data.id && data.email && data.role) {
        userData = data;
      }

      if (!userData) {
        console.error("Could not extract user data from response:", data);
        router.push("/login");
        return;
      }

      setUser(userData);

      if (userData.role && userData.role.toLowerCase() !== role.toLowerCase()) {
        router.push(`/dashboard/${userData.role.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleConfig = {
    user: {
      color: "emerald",
      gradient: "from-emerald-600 to-emerald-500",
      borderColor: "border-emerald-500/20",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    volunteer: {
      color: "amber",
      gradient: "from-amber-600 to-amber-500",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    authority: {
      color: "blue",
      gradient: "from-blue-600 to-blue-500",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    admin: {
      color: "purple",
      gradient: "from-purple-600 to-purple-500",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  };

  const config = roleConfig[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link
                href="/dashboard/user"
                className="flex items-center gap-3 group"
              >
                <div className="hidden sm:block">
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    BinBuddy
                  </span>
                  <p className="text-xs text-slate-500 font-medium -mt-1">
                    Waste Management
                  </p>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Points Display */}
              <Link
                href="/dashboard/leaderboard"
                className={`hidden md:flex items-center gap-3 px-4 py-2.5 ${config.bgColor} hover:bg-opacity-80 rounded-xl border ${config.borderColor} cursor-pointer transition-all hover:scale-105 group`}
              >
                <div className="relative">
                  <Award className={`${config.textColor} w-5 h-5`} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`${config.textColor} font-bold text-lg leading-none`}
                  >
                    {user.points}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">
                    points
                  </span>
                </div>
                <ChevronRight
                  className={`${config.textColor} w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 hover:border-red-500/30 font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`p-5 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl shadow-lg`}
              >
                <User className="text-white w-10 h-10" />
              </div>
              {role === "admin" && (
                <div className="absolute -top-2 -right-2 p-1.5 bg-yellow-500 rounded-lg shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}
              </h2>
              <p className="text-slate-400 text-sm mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} border ${config.borderColor} rounded-lg`}
                >
                  <span
                    className={`${config.textColor} font-semibold capitalize text-sm`}
                  >
                    {user.role}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-slate-300 font-medium text-sm">
                    {user.points} points
                  </span>
                </span>
              </div>
            </div>

            {/* Mobile Points Display */}
            <Link
              href="/dashboard/leaderboard"
              className={`md:hidden w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 ${config.bgColor} hover:bg-opacity-80 rounded-xl border ${config.borderColor} transition-all`}
            >
              <Award className={`${config.textColor} w-5 h-5`} />
              <span className={`${config.textColor} font-bold text-lg`}>
                {user.points} points
              </span>
              <ChevronRight className={`${config.textColor} w-4 h-4`} />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-sm">
                © 2024 BinBuddy. Building sustainable communities.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
