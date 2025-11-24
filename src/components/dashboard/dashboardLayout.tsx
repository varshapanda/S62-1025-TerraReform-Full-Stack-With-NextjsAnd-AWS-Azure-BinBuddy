"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, LogOut, User, Award, Menu, X } from "lucide-react";
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
      console.log("Full API Response:", data); // Debug log

      // Handle different response structures
      let userData: UserData | null = null;

      if (data.user) {
        // Structure: { success: true, user: {...} }
        userData = data.user;
      } else if (data.data && data.data.user) {
        // Structure: { success: true, data: { user: {...} } }
        userData = data.data.user;
      } else if (data.id && data.email && data.role) {
        // Structure: Direct user object
        userData = data;
      }

      if (!userData) {
        console.error("Could not extract user data from response:", data);
        router.push("/login");
        return;
      }

      setUser(userData);

      // Verify role matches (case-insensitive)
      if (userData.role && userData.role.toLowerCase() !== role.toLowerCase()) {
        console.log(`Role mismatch: expected ${role}, got ${userData.role}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleColors = {
    user: "emerald",
    volunteer: "amber",
    authority: "blue",
    admin: "purple",
  };

  const color = roleColors[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-2">
                <Leaf className="text-emerald-400" size={32} />
                <span className="text-2xl font-bold text-white">BinBuddy</span>
              </div>
            </div>

            {/* User Info & Logout */}
            <Link
              href="/dashboard/leaderboard"
              className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-600 transition"
            >
              <Award className={`text-${color}-400`} size={20} />
              <span className="text-white font-semibold">
                {user.points} pts
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/30"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-${color}-500/10 rounded-full`}>
              <User className={`text-${color}-400`} size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-slate-400">{user.email}</p>
            </div>
            <div
              className={`px-4 py-2 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}
            >
              <span className={`text-${color}-400 font-semibold capitalize`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
